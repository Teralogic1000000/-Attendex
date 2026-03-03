import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import request from 'supertest'
import app from '../src/app.js'
import prisma from '../src/config/prisma.js'
import bcrypt from 'bcrypt'
import { setupTestDB, cleanupTestDB } from './setup.js'

describe('Auth Controller', () => {
  let testData

  beforeAll(async () => {
    testData = await setupTestDB()
  })

  afterAll(async () => {
    await cleanupTestDB()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new organization and user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          orgName: 'New Org',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@neworg.com',
          password: 'Test@1234',
          confirmPassword: 'Test@1234',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('tokens')
      expect(res.body.data.tokens).toHaveProperty('accessToken')
      expect(res.body.data).toHaveProperty('user')
      expect(res.body.data.user.firstName).toBe('John')
    })

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app).post('/api/auth/register').send({
        orgName: 'New Org',
        firstName: 'John',
        // Missing other fields
      })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should return 400 if passwords do not match', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          orgName: 'New Org',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@neworg.com',
          password: 'Test@1234',
          confirmPassword: 'Different@1234',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should return 400 if email already exists', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          orgName: 'Another Org',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@testorg.com', // Already exists
          password: 'Test@1234',
          confirmPassword: 'Test@1234',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login user with correct credentials', async () => {
      // First create a user with known password
      const hashedPassword = await bcrypt.hash('Test@1234', 10)
      const user = await prisma.user.create({
        data: {
          firstName: 'Login',
          lastName: 'Test',
          email: 'login@test.com',
          password: hashedPassword,
          orgId: testData.org.id,
          roleId: (await prisma.role.findUnique({ where: { name: 'Employee' } }))
            .id,
        },
      })

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'Test@1234',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('tokens')
      expect(res.body.data.tokens).toHaveProperty('accessToken')
      expect(res.body.data.tokens).toHaveProperty('refreshToken')
      expect(res.body.data.user).toHaveProperty('firstName')

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } })
    })

    it('should return 401 with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@testorg.com',
          password: 'WrongPassword',
        })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('should return 404 if user not found', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Test@1234',
        })

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
    })
  })
})
