import React, { Component } from "react";
import { getCurrentUser, fetchUserAttributes } from "@aws-amplify/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

interface PQRFormState {
  prqDescription: string;
  prqImage: File | null;
  prqEmail: string;
  showModal: boolean;
  modalMessage: string;
  modalType: "success" | "error" | "";
  isAuthenticated: boolean;
}

export default class PQRForm extends Component<{}, PQRFormState> {
  private s3Client: S3Client;

  constructor(props: {}) {
    super(props);
    this.state = {
      prqDescription: "",
      prqImage: null,
      prqEmail: "",
      showModal: false,
      modalMessage: "",
      modalType: "",
      isAuthenticated: false,
    };

    this.s3Client = new S3Client({
      region: process.env.NEXT_PUBLIC_S3_BUCKET_REGION!,
    });
  }

  async componentDidMount() {
    try {
      const user = await getCurrentUser();
      console.log("✅ Usuario autenticado:", user);

      if (user) {
        this.setState({ isAuthenticated: true });

        // Obtener atributos del usuario (opcional)
        const attributes = await fetchUserAttributes();
        console.log("✅ Atributos del usuario:", attributes);
      }
    } catch (error) {
      console.error("❌ No hay sesión activa:", error);
      window.location.href = "/";
    }
  }

  uploadToS3 = async (file: File): Promise<string | null> => {
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
    if (!bucketName) {
      console.error("❌ El nombre del bucket no está configurado.");
      alert("Error de configuración. Contacta al administrador.");
      return null;
    }

    const fileKey = `prq-images/${Date.now()}_${file.name}`;
    console.log("📤 Subiendo archivo a S3:", file.name);
    console.log("🔹 Bucket:", bucketName);
    console.log("🔹 Clave del archivo:", fileKey);

    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: file,
        ContentType: file.type,
        ACL: "public-read",
      });

      await this.s3Client.send(command);
      const uploadedUrl = `https://${bucketName}.s3.${process.env.NEXT_PUBLIC_S3_BUCKET_REGION}.amazonaws.com/${fileKey}`;
      console.log("✅ Imagen subida con éxito a:", uploadedUrl);

      return uploadedUrl;
    } catch (error) {
      console.error("❌ Error al subir la imagen a S3:", error);
      alert("Hubo un error al subir la imagen. Inténtalo de nuevo.");
      return null;
    }
  };

  handlePRQSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { prqDescription, prqImage, prqEmail } = this.state;

    if (prqDescription.length < 15) {
      alert("⚠️ La descripción debe tener al menos 15 caracteres.");
      return;
    }

    let imageUrl: string | null = null;
    if (prqImage) {
      const maxFileSize = 15 * 1024 * 1024;
      if (prqImage.size > maxFileSize) {
        alert("⚠️ El tamaño máximo permitido para la imagen es de 15 MB.");
        return;
      }

      console.log("🖼️ Imagen seleccionada para subir:", prqImage.name);
      imageUrl = await this.uploadToS3(prqImage);
      if (!imageUrl) return;
    }

    const requestBody = { prqDescription, imageUrl, prqEmail };
    console.log("📨 Enviando solicitud con el siguiente cuerpo:", requestBody);

    try {
      const response = await fetch(
        "https://4e2uo1y7p0.execute-api.us-east-1.amazonaws.com/prod/pqr",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        console.log("✅ PQR enviado correctamente.");
        this.setState({
          showModal: true,
          modalMessage: "Tu PQR se envió exitosamente.",
          modalType: "success",
          prqDescription: "",
          prqImage: null,
          prqEmail: "",
        });
      } else {
        console.error("❌ Error al enviar el PQR, respuesta del servidor:", await response.json());
        this.setState({
          showModal: true,
          modalMessage: "Hubo un error al enviar el PQR. Inténtalo de nuevo.",
          modalType: "error",
        });
      }
    } catch (error) {
      console.error("❌ Error enviando el PQR:", error);
      this.setState({
        showModal: true,
        modalMessage: "Hubo un error al enviar el PQR. Inténtalo de nuevo.",
        modalType: "error",
      });
    }
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { showModal, modalMessage, modalType, prqDescription, prqEmail, isAuthenticated } = this.state;

    if (!isAuthenticated) {
      return (
        <div>
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Acceso Restringido</h5>
                  <button type="button" className="close" onClick={this.closeModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">{modalMessage}</div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary" onClick={this.closeModal}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container-fluid bg-tecnologia p-5" id="tecnologia">
        <div className="container mt-5 p-4">
          <button
            className="btn mb-4"
            style={{ color: "#1C3541" }}
            onClick={() => (window.location.href = "/")}
          >
            &larr; Regresar
          </button>

          <h2 className="text-center mb-4">Envía tu PQR</h2>
          <form onSubmit={this.handlePRQSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="prqDescription">Descripción de la consulta</label>
              <textarea
                className="form-control"
                id="prqDescription"
                rows={3}
                value={prqDescription}
                onChange={(e) => this.setState({ prqDescription: e.target.value })}
                required
                minLength={15}
                placeholder="Describe detalladamente tu consulta"
              ></textarea>
            </div>
            <div className="form-group mb-3">
              <label htmlFor="prqImage">Imagen (opcional)</label>
              <input
                type="file"
                className="form-control-file"
                id="prqImage"
                accept="image/png, image/jpeg, image/jpg, image/gif, application/pdf"
                onChange={(e) => this.setState({ prqImage: e.target.files ? e.target.files[0] : null })}
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="prqEmail">Correo de contacto</label>
              <input
                type="email"
                className="form-control"
                id="prqEmail"
                value={prqEmail}
                onChange={(e) => this.setState({ prqEmail: e.target.value })}
                required
                placeholder="Ingresa tu correo electrónico"
              />
            </div>
            <button type="submit" className="btn w-100 mt-3" style={{ backgroundColor: "#1C3541", color: "#fff" }}>
              Enviar PQR
            </button>
          </form>
        </div>
      </div>
    );
  }
}
