import React, { useEffect, useState } from 'react';
import { MyPage } from '@suan/components/common/types';
import { S3 } from 'aws-sdk';
import { fetchAuthSession } from 'aws-amplify/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const PQRForm: MyPage = () => {
  const [prqDescription, setPrqDescription] = useState('');
  const [prqImage, setPrqImage] = useState<File | null>(null);
  const [prqEmail, setPrqEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | ''>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await fetchAuthSession();
        if (session?.tokens?.idToken) {
          setIsAuthenticated(true);
        } else {
          throw new Error('No session found');
        }
      } catch (error) {
        console.error('No hay sesión activa:', error);
        window.location.href = '/';
      }
    };

    checkSession();
  }, []);

  const handlePRQSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Si no se necesita la URL de la imagen, dejamos este valor como null
    const imageUrl: string | null = null;

    // Crear el cuerpo de la solicitud con solo los textos
    const requestBody = { 
        prqDescription, 
        imageUrl, // Puede ser eliminado si el backend no requiere este campo
        prqEmail 
    };

    try {
        const response = await fetch(
            'https://y2alnoyxxc.execute-api.us-east-1.amazonaws.com/QA/',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            }
        );

        if (response.ok) {
            toast.success('Tu PQR se envió exitosamente.');
            setPrqDescription('');
            setPrqImage(null); // Limpia el estado de la imagen
            setPrqEmail('');
        } else {
            toast.error('Hubo un error al enviar el PQR. Inténtalo de nuevo.');
        }
    } catch (error) {
        console.error('Error enviando el PQR:', error);
        toast.error('Hubo un error al enviar el PQR. Inténtalo de nuevo.');
    }
};

  

  if (!isAuthenticated) {
    return <div style={styles.loading}>Cargando...</div>;
  }

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => (window.location.href = '/home')}>
        &larr; Regresar
      </button>
      <h2 style={styles.title}>Envía tu PQR</h2>
      <form onSubmit={handlePRQSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="prqDescription">Descripción de la consulta</label>
          <textarea
            style={styles.textArea}
            id="prqDescription"
            rows={5}
            value={prqDescription}
            onChange={(e) => setPrqDescription(e.target.value)}
            required
            minLength={30}
            placeholder="Describe detalladamente tu consulta"
          ></textarea>
          <small style={styles.smallText}>La descripción debe tener al menos 30 caracteres.</small>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="prqImage">Imagen (opcional)</label>
          <input
            type="file"
            style={styles.fileInput}
            id="prqImage"
            accept="image/png, image/jpeg, image/jpg, image/gif, application/pdf"
            onChange={(e) => {
              const file = e.target.files ? e.target.files[0] : null;
  
              if (file && !['image/png', 'image/jpeg', 'image/jpg', 'image/gif',"application/pdf"].includes(file.type)) {
                toast.error('Formato no válido. Solo se permiten PNG, JPEG, JPG, GIF o PDF.');
                e.target.value = ''; // Limpiar el input si el archivo no es válido
                return;
              }
  
              setPrqImage(file);
            }}
          />
          <small style={styles.smallText}>
            Formatos aceptados: PNG, JPEG, JPG, GIF O PDF. Tamaño máximo: 15 MB.
          </small>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="prqEmail">Correo de contacto</label>
          <input
            type="email"
            style={styles.input}
            id="prqEmail"
            value={prqEmail}
            onChange={(e) => setPrqEmail(e.target.value)}
            required
            placeholder="Ingresa tu correo electrónico"
          />
        </div>
        <button type="submit" style={styles.submitButton}>
          Enviar PQR
        </button>
      </form>
  
      {/* Contenedor de notificaciones */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
  
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    marginBottom: '20px',
    color: '#1C3541',
    textDecoration: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const, // Solución al error de flexDirection
  },
  formGroup: {
    marginBottom: '20px',
  },
  textArea: {
    width: '100%',
    height: '120px',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  fileInput: {
    display: 'block',
    marginTop: '5px',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  submitButton: {
    backgroundColor: '#1C3541',
    color: '#fff',
    border: 'none',
    padding: '15px',
    cursor: 'pointer',
    borderRadius: '5px',
    fontSize: '18px',
  },
  smallText: {
    fontSize: '12px',
    color: '#666',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    marginTop: '50px',
  },
};

export default PQRForm;
PQRForm.Layout = 'Main';
