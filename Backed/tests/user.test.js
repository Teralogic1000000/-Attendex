import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import request from 'supertest'
import app from '../src/app.js'
import prisma from '../src/config/prisma.js'
import jwt from 'jsonwebtoken'
import { setupTestDB, cleanupTestDB } from './setup.js'

describe('User Controller', () => {
  let testData
  let authToken
  let userId

  beforeAll(async () => {
    testData = await setupTestDB()

    // Create token for authenticated requests
    authToken = jwt.sign(
      {
        id: testData.admin.id,
        orgId: testData.org.id,
        role: 'Org_Admin',
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '15m' }
    )
  })

  afterAll(async () => {
    await cleanupTestDB()
  })

  describe('POST /api/users', () => {
    it('should create a new user in organization', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Employee',
          email: 'john.emp@test.com',
          password: 'Emp@1234',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data.firstName).toBe('John')
      expect(res.body.data.email).toBe('john.emp@test.com')
      expect(res.body.data.role).toBe('Employee')

      userId = res.body.data.id
    })

    it('should return 400 if email already exists', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Duplicate',
          lastName: 'User',
          email: 'john.emp@test.com', // Already exists
          password: 'Emp@1234',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should return 400 if required fields missing', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          // Missing other required fields
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/users', () => {
    it('should fetch all users in organization', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('users')
      expect(Array.isArray(res.body.data.users)).toBe(true)
      expect(res.body.data).toHaveProperty('pagination')
    })

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 5 })

      expect(res.status).toBe(200)
      expect(res.body.data.pagination.page).toBe(1)
      expect(res.body.data.pagination.limit).toBe(5)
    })
  })

  describe('GET /api/users/stats/overview', () => {
    it('should return user statistics', async () => {
      const res = await request(app)
        .get('/api/users/stats/overview')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('totalUsers')
      expect(res.body.data).toHaveProperty('presentToday')
      expect(res.body.data).toHaveProperty('avgHours')
      expect(typeof res.body.data.totalUsers).toBe('number')
    })
  })

  describe('PUT /api/users/:id', () => {
    it('should update user information', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.firstName).toBe('Updated')
    })

    it('should return 404 if user not found', async () => {
      const res = await request(app)
        .put('/api/users/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Test',
          lastName: 'User',
        })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      // Create a user to delete
      const user = await prisma.user.create({
        data: {
          firstName: 'Delete',
          lastName: 'Me',
          email: 'delete@test.com',
          password: 'Test@1234',
          orgId: testData.org.id,
          roleId: (await prisma.role.findUnique({ where: { name: 'Employee' } }))
            .id,
        },
      })

      const res = await request(app)
        .delete(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      // Verify deletion
      const deletedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })
      expect(deletedUser).toBeNull()
    })
  })
})
