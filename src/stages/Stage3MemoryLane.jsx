import { motion } from 'framer-motion';
import { usePhotos } from '../context/PhotoContext';

const defaultPhotos = [
  { id: 'default-1', src: '/memories/memory1.jpg', caption: 'Family Moment ❤️' },
  { id: 'default-2', src: '/memories/memory2.jpg', caption: 'Chota Don 😒😎' },
  { id: 'default-3', src: '/memories/memory3.jpg', caption: 'My Smile Queen 💕' },
  { id: 'default-4', src: '/memories/memory4.jpg', caption: 'Cute Panda🐼' },
  { id: 'default-5', src: '/memories/memory5.jpg', caption: 'Secret Wallpaper🫠' },
  { id: 'default-6', src: '/memories/memory6.jpg', caption: 'Cutie Pie 🥰' },
  { id: 'default-7', src: '/memories/memory7.jpg', caption: 'Those Eyes 🥹👀🫠' },
  { id: 'default-8', src: '/memories/memory8.jpg', caption: 'Favourite Pic 🌸' },
  { id: 'default-9', src: '/memories/memory9.jpg', caption: 'Cute Pose🫣🥰' },
  { id: 'default-10', src: '/memories/memory10.jpg', caption: 'Happy mood😊' },
  { id: 'default-11', src: '/memories/memory11.jpg', caption: 'My Sister🥰😍' },
  { id: 'default-12', src: '/memories/memory12.jpg', caption: 'Naa Gaajubomma🧿' }
];

export default function Stage3MemoryLane() {
  const { photos, deletePhoto } = usePhotos();

  const allPhotos = [...defaultPhotos, ...photos];

  return (
    <section className="screen gallery-screen">
      <motion.div
        className="gallery-header"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="camera-icon">📷</div>
        <h1>Cute Little Moments 💝🧿</h1>

        <div className="polaroid-grid">
          {allPhotos.map((photo, index) => (
            <motion.figure
              className="polaroid"
              key={photo.id}
              initial={{ opacity: 0, rotate: 0, y: 20 }}
              animate={{ opacity: 1, rotate: index % 2 ? 2 : -2, y: 0 }}
              whileHover={{ y: -5, scale: 1.025, rotate: index % 2 ? 1 : -1 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
            >
              <img src={photo.src} alt={photo.caption || 'Memory'} />
              <figcaption>{photo.caption}</figcaption>

              {!photo.id.startsWith('default') && (
                <button onClick={() => deletePhoto(photo.id)} aria-label="Delete photo">
                  ×
                </button>
              )}
            </motion.figure>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
