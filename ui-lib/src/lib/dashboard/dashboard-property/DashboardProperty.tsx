import Link from 'next/link';
import { MyPage } from '../../common/types';
import { useState, useEffect } from 'react';
import Card from '@marketplaces/ui-lib/src/lib/common/Card';
import React, { useRef } from 'react';
import mapboxgl, { Popup } from 'mapbox-gl';
import dynamic from 'next/dynamic';
import {
  FaTree,
  FaInfoCircle,
  FaChartBar,
  FaLeaf,
  FaMapSigns,
} from 'react-icons/fa';
import shp from 'shpjs';
import { FeatureCollection } from 'geojson';
import { toGeoJSON } from '@marketplaces/utils-2';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouter } from 'next/router';

interface Layer {
  type: 'geojson' | 'tif'; // Agregar otros tipos si es necesario
  data: any; // Cambiar el tipo según sea necesario
}

interface MapComponentProps {
  lat: number;
  lng: number;
  layers?: Layer[]; // Cambiar el tipo de layers
}

const MapComponent: React.FC<MapComponentProps> = ({ lat, lng, layers }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (mapContainer.current && !map) {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [lng, lat],
        zoom: 12,
      });

      newMap.on('load', () => {
        setMapLoaded(true);
      });

      newMap.on('draw.create', function (e: any) {
        if (e.features.length && e.features[0].geometry.type === 'Point') {
          const center = e.features[0].geometry.coordinates;
          //map.setCenter(center);
          newMap.easeTo({ center: center });
        }
      });

      setMap(newMap);
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [mapContainer, map, lat, lng]);

  useEffect(() => {
    if (map && mapLoaded && layers) {
      layers.forEach((layer: any) => {
        if (layer.type === 'geojson') {
          map.addSource('geojson-layer', {
            type: 'geojson',
            data: layer.data,
          });
          map.addLayer({
            id: 'geojson-layer',
            type: 'fill',
            source: 'geojson-layer',
            layout: {
              'text-field': ['get', 'name'],
            },
            paint: {
              'fill-color': '#888',
              'fill-opacity': 0.5,
            },
          });
          map.on('click', 'geojson-layer', (e: any) => {
            if (e.features.length) {
              const feature = e.features[0];
              new Popup()
                .setLngLat({ lat: -71.77298426628113, lng: 4.525238611953952 })
                .setHTML(`<h3>Holaaaaaaaaa</h3>`)
                .addTo(map);
            }
          });
          map.on('mouseenter', 'geojson-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
          });

          map.on('mouseleave', 'geojson-layer', () => {
            map.getCanvas().style.cursor = '';
          });
        } else if (layer.type === 'tif') {
          map.addSource('tif-layer', {
            type: 'raster',
            tiles: layer.data,
            tileSize: 256,
          });
          map.addLayer({
            id: 'tif-layer',
            type: 'raster',
            source: 'tif-layer',
          });
        }
      });
    }
  }, [map, mapLoaded, layers]);

  return (
    <div
      ref={mapContainer}
      className="h-64 w-full rounded-lg overflow-hidden"
    />
  );
};

const CustomCard: React.FC<{
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}> = ({ title, value, description, icon }) => (
  <div className="bg-white shadow-lg rounded-lg p-6 flex items-center">
    {icon && <div className="text-green-600 text-3xl mr-4">{icon}</div>}
    <div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-xl font-semibold">{value}</p>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  </div>
);

// Importaciones dinámicas para los gráficos
const ResponsiveBar = dynamic(
  () => import('@nivo/bar').then((mod) => mod.ResponsiveBar),
  { ssr: false }
);
const ResponsivePie = dynamic(
  () => import('@nivo/pie').then((mod) => mod.ResponsivePie),
  { ssr: false }
);

export default function DashboardProperty(props: any) {
  const { property, propertyData, propertyId } = props;
  const [availableTokenAmount, setAvailableTokenAmount] = useState<
    number | null
  >(100); // Datos de prueba
  const [geoJsonData, setGeoJsonData] = useState<any>(null); // Estado para almacenar el GeoJSON
  const [tifData, setTifData] = useState<any>(null); // Estado para almacenar el GeoJSON

  const router = useRouter();

  console.log(propertyData);

  // Datos de prueba
  const title = 'Proyecto Verde';
  const location = 'Cundinamarca, Colombia';
  const projectStatus = 'En Progreso';
  const projectLifetime = '2024 - 2064 (40 años)'; // Tiempo de vida del proyecto
  const projectValidator = 'Validador XYZ'; // Validador del proyecto
  const locationDescription =
    'Esta sección describe la ubicación y los límites del proyecto, que se extiende por áreas significativas de terreno en Cundinamarca, ofreciendo un ecosistema diverso y oportunidades para la conservación y reforestación.';
  const description =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis condimentum orci, vel porta sapien. Nunc sed diam suscipit, fermentum dolor ut, mollis massa. Integer aliquet lacus a sodales gravida. Praesent sit amet sem ipsum. Phasellus vehicula a arcu vitae euismod. Aenean eu purus et libero commodo facilisis ut at mi. Integer ultricies sagittis libero, at tempus eros interdum id.';
  const projectArea = 500; // en hectáreas
  const biomass = 10; // toneladas por hectárea
  const suitability = 'Alta';
  const topography = 'Montañosa';

  // Coordenadas de prueba
  const lat = 4.491159334809308;
  const lng = -71.79995466514166;

  const pieData = [
    { id: 'Aptitud Forestal', value: 60 },
    { id: 'Topografía', value: 40 },
  ];

  const soilLayersData = [
    { layer: 'Estrato Superior', area: 200 }, // en hectáreas
    { layer: 'Estrato Medio', area: 150 },
    { layer: 'Estrato Inferior', area: 100 },
  ];

  const documents = [
    {
      title: 'Documento 1',
      url: 'https://www.nat5.bio/wp-content/uploads/2024/10/Evaluacion-de-Alineamiento-RG-001-01062024-GUACAMAYAs-VICHADA-COLOMBIA.pdf',
    },
    { title: 'Documento 2', url: '#' },
    { title: 'Documento 3', url: '#' },
    { title: 'Documento 4', url: '#' },
  ];

  // Función para cargar y convertir el KMZ a GeoJSON
  const loadSHP = async () => {
    const response = await fetch(
      's3://platformde0a42c18c744a9cae17f9d001d263e96c75a-internal/public/borrar/20240904_AGR_Aptitud_Forestal_2014_corregida (2).zip'
    );
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const geojson = await shp(arrayBuffer);
    console.log('geojson', geojson);
    setGeoJsonData(geojson); // Almacenar el GeoJSON en el estado
  };

  const loadKML = async () => {
    const response = await fetch(
      'https://platformde0a42c18c744a9cae17f9d001d263e96c75a-internal.s3.us-east-1.amazonaws.com/public/borrar/505680001000000010235000000000.kml'
    );
    const blob = await response.blob();
    const text = await blob.text(); // Obtener el texto del blob
    const parser = new DOMParser();
    const kml = parser.parseFromString(text, 'application/xml'); // Convertir a objeto DOM
    const geojson = toGeoJSON.kml(kml); // Convertir KML a GeoJSON
    console.log('geojson', geojson);
    setGeoJsonData(geojson); // Almacenar el GeoJSON en el estado
  };

  useEffect(() => {
    loadKML(); // Cargar el KMZ al montar el componente
  }, []);

  return (
    <div className="min-h-screen p-5 bg-gradient-to-r from-green-200 via-green-300 to-green-200">
      <div className="flex justify-between">
        <button
          onClick={() => router.back()}
          className={`  flex items-center text-[#287993] text-sm`}
        >
          <svg
            className={` w-3 h-3 mr-2 text-[#287993]  dark:text-white`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 8 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"
            />
          </svg>
          Regresar
        </button>
      </div>
      {/* Encabezado */}
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-10 transition-transform transform hover:scale-105">
        <h1 className="text-6xl font-bold text-green-800 text-center">
          {propertyData.name}
        </h1>
        <p className="text-4xl text-green-600 mt-2 text-center">
          {propertyData.location}
        </p>
        <p className="text-lg text-gray-700 mt-4 text-center">
          {propertyData.description}
        </p>
      </div>

      {/* Ubicación y Límites del Proyecto */}
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-10 transition-transform transform hover:scale-105">
        <h2 className="text-5xl font-semibold text-green-800 text-center">
          Ubicación y Límites del Proyecto
        </h2>
        <p className="text-lg text-gray-700 mt-4 text-center">
          {locationDescription}
        </p>
        <MapComponent
          lat={lat}
          lng={lng}
          layers={
            geoJsonData
              ? [
                  { type: 'geojson', data: geoJsonData },
                  {
                    type: 'tif',
                    data: [
                      'https://platformde0a42c18c744a9cae17f9d001d263e96c75a-internal.s3.us-east-1.amazonaws.com/public/borrar/20240904_AGR_Coberturas_Miralindo_2023.tif',
                    ],
                  },
                ]
              : []
          }
        />
      </div>

      {/* Información del proyecto */}
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-10 transition-transform transform hover:scale-105">
        <h2 className="text-5xl font-semibold text-green-800 text-center">
          Información del proyecto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <CustomCard
            title="Estado del proyecto"
            value={projectStatus}
            icon={<FaInfoCircle />}
          />
          <CustomCard
            title="Área del proyecto (ha)"
            value={projectArea}
            icon={<FaMapSigns />}
          />
          <CustomCard
            title="Biomasa (t/ha)"
            value={biomass}
            icon={<FaLeaf />}
          />
          <CustomCard
            title="Aptitud forestal"
            value={suitability}
            icon={<FaTree />}
          />
          <CustomCard
            title="Topografía"
            value={topography}
            icon={<FaChartBar />}
          />
        </div>
      </div>

      {/* Densidad de Vegetación */}
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-10 transition-transform transform hover:scale-105">
        <h2 className="text-4xl font-semibold text-green-800">
          Densidad de Vegetación
        </h2>
        <p className="text-lg text-gray-700 mt-4">
          La densidad de vegetación en esta área es notable, con una variedad de
          especies que contribuyen a un ecosistema robusto. La vegetación densa
          no solo proporciona hábitat para la fauna local, sino que también
          juega un papel crucial en la regulación del clima y la conservación
          del suelo.
        </p>
        {/* <MapComponent lat={lat} lng={lng} /> */}
      </div>

      {/* Estrato del Suelo */}
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-10 transition-transform transform hover:scale-105">
        <h2 className="text-4xl font-semibold text-green-800">
          Estrato del Suelo
        </h2>
        <p className="text-lg text-gray-700 mt-4">
          El estrato del suelo en esta región es variado, con capas que ofrecen
          diferentes nutrientes y características. Este estrato es fundamental
          para el crecimiento de la vegetación y la salud del ecosistema,
          permitiendo una rica biodiversidad.
        </p>
        {/* <MapComponent lat={lat} lng={lng} /> */}
        <div style={{ height: '300px' }}>
          <ResponsiveBar
            data={soilLayersData}
            keys={['area']}
            indexBy="layer"
            margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
            padding={0.3}
            colors={{ scheme: 'nivo' }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Estrato',
              legendPosition: 'middle',
              legendOffset: 32,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Área (ha)',
              legendPosition: 'middle',
              legendOffset: -40,
            }}
          />
        </div>
      </div>

      {/* Gráfico de Pastel */}
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-10 transition-transform transform hover:scale-105">
        <h2 className="text-4xl font-semibold text-green-800">
          Gráfico de Pastel
        </h2>
        <div style={{ height: '300px' }}>
          <ResponsivePie
            data={pieData}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={{ scheme: 'nivo' }}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
            enableArcLinkLabels={false}
            arcLinkLabelsTextColor="#ffffff"
            arcLabelsTextColor="#333333"
          />
        </div>
      </div>

      {/* Aptitud Forestal */}
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-10 transition-transform transform hover:scale-105">
        <h2 className="text-4xl font-semibold text-green-800">
          Aptitud Forestal
        </h2>
        <p className="text-lg text-gray-700 mt-4">
          La aptitud forestal de esta área es alta, lo que la convierte en un
          lugar ideal para proyectos de reforestación y conservación. La
          combinación de clima, suelo y vegetación existente crea un entorno
          propicio para el crecimiento de árboles y otras plantas.
        </p>
        {/* <MapComponent lat={lat} lng={lng} /> */}
      </div>

      {/* Resumen del Proyecto y Documentos */}
      <div className="max-w-6xl mx-auto my-10">
        <div className="flex flex-col md:flex-row mt-6 gap-8">
          {/* Tarjeta Resumen del Proyecto */}
          <div className="md:w-1/2">
            <div className="bg-gray-100 shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105">
              <h3 className="text-2xl font-bold text-green-800">
                Resumen del proyecto
              </h3>
              <ul className="mt-2 text-lg text-gray-700 space-y-4">
                <li>
                  <strong>Título del proyecto:</strong> <p>{title}</p>
                </li>
                <li>
                  <strong>Ubicación:</strong> <p>{location}</p>
                </li>
                <li>
                  <strong>Estado del proyecto:</strong> <p>{projectStatus}</p>
                </li>
                <li>
                  <strong>Tiempo de vida del proyecto:</strong>{' '}
                  <p>{projectLifetime}</p>
                </li>
                <li>
                  <strong>Validador del proyecto:</strong>{' '}
                  <p>{projectValidator}</p>
                </li>
              </ul>
            </div>
          </div>
          {/* Tarjeta Documentos */}
          <div className="md:w-1/2">
            <div className="bg-gray-100 shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105">
              <h3 className="text-2xl font-bold text-green-800">
                Documentación subida
              </h3>
              <ul className="mt-2">
                {documents.map((doc, index) => (
                  <li key={index} className="mt-2">
                    <a
                      href={doc.url}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {doc.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
