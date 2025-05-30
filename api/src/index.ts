import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'        
import { xss } from 'express-xss-sanitizer'
import path from 'path'
import routes from './routes'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'
import { closePrisma } from './prisma'
import { setupSwagger } from './docs/swagger'

const PORT = Number(process.env.PORT ?? 4000)
const app = express()

/**
 * Security and parsing middleware
 */
app.use(helmet())
app.use(cors({
  origin: (process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean),
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())                       // ← add cookie-parser here
app.use(rateLimit({ windowMs: 900_000, max: 100 }))
app.use(xss())

/**
 * Swagger UI for API docs
 */
setupSwagger(app)

/**
 * Public endpoints
 */
app.use('/api', routes.public)

/**
 * Authentication and protected endpoints
 */
app.use('/api', routes.protected)

/**
 * Serve frontend from web-dist and enable client-side routing
 */
const staticPath = path.join(__dirname, '../web-dist')
app.use(express.static(staticPath))
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'))
})

/**
 * Global error handler
 */
app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    logger.info(`Listening at http://localhost:${PORT}`)
    logger.info(`Swagger UI at http://localhost:${PORT}/api/docs`)
  })

  const shutdown = async (signal: string) => {
    try {
      logger.info(`${signal} received, shutting down`)
      await new Promise<void>(resolve => server.close(() => resolve()))
      await closePrisma()
      logger.info('Shutdown complete')
      process.exit(0)
    } catch (err) {
      logger.error('Error during shutdown', err)
      process.exit(1)
    }
  }

  ['SIGINT', 'SIGTERM'].forEach(sig =>
    process.on(sig, () => shutdown(sig))
  )
}

export default app
