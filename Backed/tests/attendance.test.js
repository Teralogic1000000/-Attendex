import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import request from 'supertest'
import app from '../src/app.js'
import prisma from '../src/config/prisma.js'
import jwt from 'jsonwebtoken'
import { setupTestDB, cleanupTestDB } from './setup.js'

describe('Attendance Controller', () => {
  let testData
  let authToken
  let userId
  let orgId

  beforeAll(async () => {
    testData = await setupTestDB()

    userId = testData.admin.id
    orgId = testData.org.id

    authToken = jwt.sign(
      {
        id: userId,
        orgId: orgId,
        role: 'OrgAdmin',
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '15m' }
    )
  })

  afterAll(async () => {
    await cleanupTestDB()
  })

  describe('POST /api/attendance/checkin', () => {
    it('should create attendance check-in', async () => {
      const res = await request(app)
        .post('/api/attendance/checkin')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('record')
      expect(res.body.data.record).toHaveProperty('checkIn')
      expect(res.body.data.record.checkIn).toBeTruthy()
    })

    it('should return 400 if already checked in today', async () => {
      // First check-in already done above
      const res = await request(app)
        .post('/api/attendance/checkin')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })

  describe('POST /api/attendance/checkout', () => {
    beforeEach(async () => {
      // Ensure there's a check-in for today
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const existing = await prisma.attendance.findFirst({
        where: { userId, date: today },
      })

      if (!existing) {
        await prisma.attendance.create({
          data: {
            userId,
            orgId,
            date: today,
            checkIn: new Date(),
          },
        })
      }
    })

    it('should create attendance check-out', async () => {
      const res = await request(app)
        .post('/api/attendance/checkout')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('record')
      expect(res.body.data.record).toHaveProperty('checkOut')
      expect(res.body.data.record).toHaveProperty('totalHours')
      expect(typeof res.body.data.record.totalHours).toBe('number')
    })

    it('should return 400 if not checked in', async () => {
      // Delete today's check-in
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      await prisma.attendance.deleteMany({
        where: { userId, date: today },
      })

      const res = await request(app)
        .post('/api/attendance/checkout')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/attendance/me', () => {
    it('should fetch user attendance records', async () => {
      const res = await request(app)
        .get('/api/attendance/me')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('records')
      expect(Array.isArray(res.body.data.records)).toBe(true)
      expect(res.body.data).toHaveProperty('stats')
      expect(res.body.data).toHaveProperty('todayRecord')
    })

    it('should include statistics in response', async () => {
      const res = await request(app)
        .get('/api/attendance/me')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.body.data.stats).toHaveProperty('daysPresent')
      expect(res.body.data.stats).toHaveProperty('avgHours')
      expect(res.body.data.stats).toHaveProperty('streak')
    })
  })

  describe('GET /api/attendance', () => {
    it('should fetch organization attendance records', async () => {
      const res = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('records')
      expect(Array.isArray(res.body.data.records)).toBe(true)
      expect(res.body.data).toHaveProperty('stats')
    })

    it('should include org stats in response', async () => {
      const res = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.body.data.stats).toHaveProperty('totalEmployees')
      expect(res.body.data.stats).toHaveProperty('presentToday')
      expect(res.body.data.stats).toHaveProperty('avgHours')
    })
  })
})
