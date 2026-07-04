import { motion } from 'framer-motion';
import { usePhotos } from '../context/PhotoContext';

export default function Stage3MemoryLane() {
  const { photos, addPhotos, deletePhoto } = usePhotos();

  const captions = [
    'Those Eyes🫠',
    'Favourite Pic 🌸',
    'My Smile Queen 💕',
    'Chota Don😎',
    'Family Moment ❤️',
    'Cutie Pie🥰',
    'Cute Sister 🫶',
    'Secret Wallpaper🥹',
    'Happy mood😌😊',
    'All time Favourite💖',
    'Beautiful Soul 🌷',
    'My Cute Sister 💕'
  ];

  return (
    <section className="screen gallery-screen">
      <motion.div
        className="gallery-header"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="camera-icon">📷</div>
        <h1>Little Moments 💖</h1>

        <label className="upload-label">
          Upload Photos
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => addPhotos(event.target.files)}
          />
        </label>
      </motion.div>

      <div className="polaroid-grid">
        {photos.length === 0 && (
          <div className="empty-polaroid">
            Add your favorite photos here. They will stay after refresh.
          </div>
        )}

        {photos.map((photo, index) => (
          <motion.figure
            className="polaroid"
            key={photo.id}
            initial={{ opacity: 0, rotate: 0, y: 20 }}
            animate={{ opacity: 1, rotate: index % 2 ? 2 : -2, y: 0 }}
            whileHover={{ y: -5, scale: 1.025, rotate: index % 2 ? 1 : -1 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
          >
            <img src={photo.src} alt={photo.name || 'Uploaded memory'} />

            <figcaption>
              {photo.caption || captions[index] || `Memory #${photos.length - index}`}
            </figcaption>

            <button onClick={() => deletePhoto(photo.id)} aria-label="Delete photo">
              ×
            </button>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}