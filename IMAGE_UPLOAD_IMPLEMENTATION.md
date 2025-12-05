# Image Upload Feature Implementation

## Overview

Added image upload functionality to the question creation and editing system. Users can now attach images to questions and sub-questions, which will be displayed during question answering.

## Backend Changes

### 1. Multer Configuration (`backend/src/config/multer.ts`)

-   Created multer middleware for handling multipart/form-data file uploads
-   Configured file storage in `backend/uploads/questions/` directory
-   File filter: Only allows image types (JPEG, PNG, GIF, WebP)
-   File size limit: 5MB
-   Automatic filename generation with timestamp and random suffix

### 2. Database Model (`backend/src/models/question.model.ts`)

-   Updated `updateQuestion()` to accept optional `imagePath` parameter
-   Image paths are stored as relative URLs (e.g., `/uploads/questions/filename.jpg`)

### 3. Controller (`backend/src/controllers/question.controller.ts`)

-   Updated Zod schemas to accept optional `imagePath` field
-   `createQuestionController`: Handles file from `req.file` if present
-   `updateQuestionController`: Handles file updates
-   Parses `deckId` and `parentId` from string to number when using FormData

### 4. Routes (`backend/src/routes/question.route.ts`)

-   Added multer middleware `upload.single('image')` to POST and PATCH endpoints
-   Field name: `image`

### 5. Server (`backend/src/server.ts`)

-   Added static file serving for `/uploads` directory
-   Images accessible at: `http://localhost:8000/uploads/questions/filename.jpg`

## Frontend Changes

### 1. Service Layer (`frontend/src/services/question.service.ts`)

-   Updated `Question` interface to include `imagePath?: string | null`
-   Updated `CreateQuestionBody` and `UpdateQuestionBody` to include `image?: File | null`
-   Modified `useCreateQuestion()` to use FormData instead of JSON
-   Modified `useUpdateQuestion()` to use FormData instead of JSON
-   Set proper Content-Type header: `multipart/form-data`

### 2. Edit Page (`frontend/src/app/decks/edit/[id]/page.tsx`)

-   Added state for image files: `editImage`, `addImage`
-   Added file input fields in both Add and Edit dialogs
-   Display current image in edit dialog if exists
-   Show preview of selected file name
-   Card grid now displays image thumbnails (w-full h-32 object-cover)

### 3. Question Page (`frontend/src/app/decks/question/[id]/page.tsx`)

-   Display images for main questions
-   Display images for sub-questions
-   Images appear above the answer input field
-   Styled with: `max-w-md rounded border shadow-sm`

## File Upload Flow

1. **User selects image** → File stored in component state
2. **User submits form** → File added to FormData with other fields
3. **Backend receives request** → Multer processes file upload
4. **File saved to disk** → Path stored in database
5. **Response sent** → Returns question with imagePath
6. **Frontend displays** → Image loaded from backend URL

## Image URL Structure

-   Backend serves from: `http://localhost:8000/uploads/questions/`
-   Full URL example: `http://localhost:8000/uploads/questions/image-1234567890-123456789.jpg`

## Security Considerations

-   File type validation (only images)
-   File size limit (5MB)
-   Unique filenames prevent overwrites
-   Files stored outside web root (in backend/uploads)

## Testing Checklist

-   [ ] Create question with image
-   [ ] Create question without image
-   [ ] Update question with new image
-   [ ] Update question without changing image
-   [ ] View question with image in question page
-   [ ] View question card with image in edit page
-   [ ] Sub-questions can have images
-   [ ] Images display correctly on mobile/desktop
-   [ ] File type validation works (try uploading non-image)
-   [ ] File size limit works (try uploading >5MB image)

## Future Enhancements

-   Image deletion when question is deleted
-   Image optimization/compression
-   Support for multiple images per question
-   Image cropping/editing tools
-   Cloud storage integration (S3, Cloudinary)
-   Preview image before upload
