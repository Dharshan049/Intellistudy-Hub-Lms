import {boolean, integer, json, pgTable, serial, text, varchar, timestamp} from 'drizzle-orm/pg-core'

export const USER_TABLE = pgTable('users', {
    id: serial().primaryKey(),
    name: varchar().notNull(),
    email: varchar().notNull(),
    isMember: boolean().default(false),
    customerId: varchar(),
    role: varchar().notNull().default('user'),
    assignedTo: varchar(), // ID of the admin this user is assigned to
});

export const STUDY_MATERIAL_TABLE = pgTable('studyMaterial', {
    id: serial().primaryKey(),
    courseId: varchar().notNull(),
    courseType: varchar().notNull(),
    topic: varchar().notNull(),
    difficultyLevel: varchar().default('Easy'),
    courseLayout: json(),
    createdBy: varchar().notNull(),
    publishedBy: varchar(), // New column to track who published the course
    status: varchar().default('Generating'),
});

export const CHAPTER_NOTES_TABLE = pgTable('chapterNotes',{
    id: serial().primaryKey(),
    courseId: varchar().notNull(),
    chapterId: integer().notNull(),
    notes: text()
});

export const STUDY_TYPE_CONTENT_TABLE = pgTable('studyTypeContent', {
    id: serial().primaryKey(),
    courseId: varchar().notNull(),
    content: json(),
    type: varchar().notNull(),
    status: varchar().default('Generating')
});

export const PAYMENT_RECORD_TABLE = pgTable('paymentRecord', {
    id: serial().primaryKey(),
    customerId: varchar(),
    sessionId: varchar(),
});

export const PUBLISHED_COURSES_TABLE = pgTable('publishedCourses', {
    id: serial().primaryKey(),
    courseId: varchar().notNull(),
    userId: varchar().notNull(),
    publishedAt: timestamp().notNull(),
});

export const QUIZ_RESULTS_TABLE = pgTable('quizResults', {
    id: serial().primaryKey(),
    courseId: varchar().notNull(),
    userId: varchar().notNull(),
    score: integer().notNull(),
    totalQuestions: integer().notNull(),
    completedAt: timestamp().notNull().defaultNow(),
});

export const STUDY_PROGRESS_TABLE = pgTable('studyProgress', {
    id: serial().primaryKey(),
    courseId: varchar().notNull(),
    userId: varchar().notNull(),
    type: varchar().notNull(), // 'notes' or 'flashcard'
    currentPosition: integer().notNull().default(0),
    totalItems: integer().notNull(),
    lastUpdated: timestamp().notNull().defaultNow(),
});