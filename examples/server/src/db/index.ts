import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import config from '@/config'

export async function openDB() {
  const db = await open({
    filename: config.db,
    driver: sqlite3.cached.Database,
  })
  sqlite3.verbose()
  console.log(`Sqlite running on ${config.db}`)
  return db
}
