import React, { useEffect, useState, useRef} from 'react'
import Modal from '../common/Modal';
import { getProjectImages, createImageOnDB, deleteImage, updateImageOnDB } from '@marketplaces/data-access';
import { TailSpin } from 'react-loader-spinner';
import { S3Client } from "@aws-sdk/client-s3";
import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand} from "@aws-sdk/client-s3";
import { fetchAuthSession, decodeJWT } from 'aws-amplify/auth';
import { toast } from 'sonner';
interface ModalTableImagesProps {
    projectID: string;
    openModal: boolean;
    handleModalImages: (id: string, open: boolean) => void
}
//upload s3, dynamo check
//delete s3,dynamo 
//get s3 check
//update isactive and carrousel

export default function ModalTableImages({projectID, openModal, handleModalImages} : ModalTableImagesProps) {
    const inputRef = useRef(null);
    const [images, setImages] = useState<any>([])
    const [clients3, setClientS3] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false)
    
    useEffect(() =>{
        setLoading(true)
        fetchAuthSession().then(data => getcreds(data.credentials))
        getProjectImages(projectID)
        .then(data => setImages(data))
        .finally(() => setLoading(false))
        
    },[openModal])
    const getcreds = async (credentials : any) => {
        //console.log(credentials, 'credentialss')

        console.log({
            region: 'us-east-1',
            credentials: {
              accessKeyId: credentials?.accessKeyId || '',
              secretAccessKey: credentials?.secretAccessKey || '',
              sessionToken: credentials?.sessionToken,
            },
          }, 'credentials')
        const s3Client = new S3Client({
          region: 'us-east-1',
          credentials: {
            accessKeyId: credentials?.accessKeyId || '',
            secretAccessKey: credentials?.secretAccessKey || '',
            sessionToken: credentials?.sessionToken,
          },
        });
        setClientS3(s3Client);
      };

    const uploadImage = async (file: File) => {
    if (!clients3) return;
    const key = `projects/${projectID}/images/${file.name}`
    const command = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_s3BucketName,
        Key: key,
        Body: file,
        ContentType: file.type,
    });

    const uploadFLow = async () => {
          try {
            await clients3.send(command);
            console.log("Image uploaded successfully to s3");
            await createImageOnDB(projectID, key, file.name)
            const newData = await getProjectImages(projectID)
            console.log(newData,'newData')
            setImages(newData)
            /* toast.success('Imagen creada exitosamente') */
        } catch (error) {
            console.error("Error uploading image:", error);
        }
      }
      toast.promise(uploadFLow(), {
        loading: 'Subiendo imagen...',
        success: (data) => {
          return `Imagen subida exitosamente`;
        },
        error: 'Error',
      });
    };
    const getImage = async (key: string) => {
        let data = {
          bucket: process.env.NEXT_PUBLIC_s3BucketName,
          key: key
        };
      
        try {
          const command = new GetObjectCommand({
            Bucket: data.bucket,
            Key: data.key,
          });
          const response = await clients3.send(command);
          const reader = await response.Body?.transformToString('base64');
      
          if (reader) {
            const base64WithoutPrefix = reader.includes(',') ? reader.split(',')[1] : reader;
            const binaryString = window.atob(base64WithoutPrefix);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
      
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
      
            const blob = new Blob([bytes], { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = key; 
            document.body.appendChild(link);
            link.click(); 
            document.body.removeChild(link);
      
            URL.revokeObjectURL(imageUrl);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      };

    const deleteImageOnS3 = async (key: string) =>{
        const deleteParams = {
            Bucket: process.env.NEXT_PUBLIC_s3BucketName,
            Key: key,
          };
          try {
            await clients3.send(new DeleteObjectCommand(deleteParams));
            return true
          } catch (error) {
            console.error(error)
            return false
          }
    }
    const toPublicImage = async (key: string, type: boolean) =>{
        let data = `${key}`.split('/')
            data.splice(2, 0, "public")
            const destionationPath = data.join("/")
            console.log(destionationPath, 'toPublicImage destionationPath')
        if(type){
            try {
                const copyParams = {
                    Bucket: process.env.NEXT_PUBLIC_s3BucketName,
                    CopySource: `${process.env.NEXT_PUBLIC_s3BucketName}/${key}`,
                    Key: destionationPath,
                };
                console.log(copyParams, ' toPublicImage copyParams ')
                await clients3.send(new CopyObjectCommand(copyParams));
                console.log(`File copied to ${destionationPath}`);
        
                return true
            } catch (error) {
                console.error('toPublicImage',error)
            }
        } else{
            const deleteParams = {
                Bucket: process.env.NEXT_PUBLIC_s3BucketName,
                Key: destionationPath,
              };
              try {
                await clients3.send(new DeleteObjectCommand(deleteParams));
                return true
              } catch (error) {
                console.error(error)
                return false
              }
        }
        
    }

    const deleteImageOnDB = async (id: string, key: string, isActive : boolean) =>{
        const deleteFlow = async () => {
          try {
            const resultDeleteOnS3 = await deleteImageOnS3(key)
            if(isActive){
              let url : string | string[] = key.split('/')
              url.splice(2,0, 'public')
              url = url.join('/')
              let publicUrl = `${url}`
              await deleteImageOnS3(publicUrl)
            }
            if(resultDeleteOnS3){
                const result = await deleteImage(id)
                const newData = await getProjectImages(projectID)
                console.log(newData,'newData')
                setImages(newData)
            }
          } catch (error) {
              
          }
        }
        toast.promise(deleteFlow(), {
          loading: 'Eliminando...',
          success: (data) => {
            return `Eliminación exitosa`;
          },
          error: 'Error',
        });
    }
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          // Verifica que el tipo de archivo sea de imagen
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
          if (!allowedTypes.includes(file.type)) {
              toast.error('Solo se permiten archivos de imagen (JPEG, PNG, GIF)');
              return;
          }
          uploadImage(file);
      }
    };

    const updateImageTable = async (type: string, item: any) =>{
      
        if(type === 'isActive'){
          /* let result = toPublicImage(item.imageURL, !item.isActive) */
          toast.promise(toPublicImage(item.imageURL, !item.isActive), {
            loading: 'Actualizando...',
            success: (data) => {
              return 'Actulización de visibilidad.';
            },
            error: 'Error',
          });
          await updateImageOnDB({
              id: item.id,
              isActive: !item.isActive,
              isOnCarousel: item.isOnCarousel
            })
            /* toast.success('Actulización de visibilidad.') */
        }else if(type === 'isOnCarousel'){
          toast.promise(updateImageOnDB({
            id: item.id,
            isActive: item.isActive,
            isOnCarousel: !item.isOnCarousel
          }), {
            loading: 'Actualizando...',
            success: (data) => {
              return 'Actulización de carrusel completada';
            },
            error: 'Error',
          });
        }
        const newData = await getProjectImages(projectID)
        setImages(newData)
    }
    const tryDeletePublicImage = async () =>{

    }

    const handleButtonClick = () => {
        //@ts-ignore
        inputRef.current.click();
    };
    return (
            <Modal show={openModal} size="6xl">
              <Modal.Header
                onClose={() => {
                    handleModalImages('',false);
                }}
              >
                <div className='w-full flex justify-between items-center'>
                    <h2 className={` text-xl`}>Imagenes del proyecto</h2>
                </div>
              </Modal.Header>
              <Modal.Body>
                <div className='w-full flex justify-end'>
                    <div className='bg-blue-600 rounded-md py-2 text-white px-4 text-sm'>
                        <button onClick={handleButtonClick}>Agregar imagen</button>
                        <input 
                            type="file" 
                            onChange={handleFileChange} 
                            ref={inputRef} 
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>
              {!loading ? 
              <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Título
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Imagen
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Es visible
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Es parte del carrousel
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Eliminar
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                        {images.map((item : any) =>{
                            return(
                                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                       {item.title}
                                    </th>
                                    <td className="px-6 py-4">
                                        <button className='bg-gray-400 rounded-md py-2 text-white px-4 text-sm' 
                                                onClick={() =>{getImage(item.imageURL)}}
                                                >Imagen</button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input type='checkbox' checked={item.isActive} onClick={() =>{updateImageTable('isActive', item)}}/>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input type='checkbox' checked={item.isOnCarousel} onClick={() =>{updateImageTable('isOnCarousel', item)}}/>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className='bg-red-600 rounded-md py-2 text-white px-4 text-sm'
                                                onClick={() =>deleteImageOnDB(item.id, item.imageURL, item.isActive)}>Eliminar</button>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
                :
                <div className='relative w-full py-10 '>
                    <TailSpin
                            width="30"
                            color="#4287f5"
                            wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            />
                </div>
                }
              </Modal.Body>
            </Modal>
      );
}
