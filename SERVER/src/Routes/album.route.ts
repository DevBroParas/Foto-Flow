import express from 'express';
import { createAlbum, deleteAlbum, getAlbumById, getUserAlbums, updateAlbum } from '../Controller/album.controller';
import { protect } from '../Middleware/auth.middleware';

const router = express.Router();

// Create a new album
router.post('/', protect, createAlbum);
// Get all albums for the logged-in user
router.get('/', protect, getUserAlbums); 
// Get album by ID
router.get('/:id', protect, getAlbumById);
// Update album by ID
router.put('/:id', protect, updateAlbum);
// Delete album by ID
router.delete('/:id', protect, deleteAlbum);

export default router;
