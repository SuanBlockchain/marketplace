import { Button, Modal } from 'flowbite-react';
import { XIcon } from '../../icons/XIcon';
import CopyToClipboard from '../../common/CopyToClipboard';
import {
  JsonView,
  allExpanded,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite';
import { useEffect, useState } from 'react';
import { getDateFromTimeStamp, hexToText, textToHex } from '@marketplaces/utils-2';

interface AssetModalProps {
  assetData: any;
  handleOpenAssetModal: (visible?: boolean, asset?: any) => void;
  openModal: boolean;
}

export default function AssetModal(props: AssetModalProps) {
  const { assetData, handleOpenAssetModal, openModal } = props;
  const [assetMetadata, setAssetMetadata] = useState<any>(null);
  const [assetInfo, setAssetInfo] = useState<any>({});

  const extractInnerObject: any = (obj: any) => {
    if (typeof obj === 'object' && obj !== null) {
      const keys = Object.keys(obj);
      if (keys.length === 1 && typeof obj[keys[0]] === 'object') {
        return extractInnerObject(obj[keys[0]]);
      }
      // Return the object if it contains more properties at the current level
      if (keys.length > 1) {
        return obj;
      }
    }
    return obj;
  };

  useEffect(() => {
    const handleAssetInfo = async () => {
      const response = await fetch(
        `/api/wallet/asset-info?policy_id=${assetData.policy_id}`
      );
      const policyIdAssetsInfoResponse = await response.json();

      console.log('policyIdAssetsInfoResponse', policyIdAssetsInfoResponse)
      console.log('assetData', assetData)
      // Filtrar asset_name
      const assetInfo = policyIdAssetsInfoResponse.find(
        (asset: any) => asset.asset === assetData.policy_id + textToHex(assetData.asset_name)
      );

      let metadata = {};

      if (assetInfo && assetInfo.metadata) {
        /* Object.entries(assetInfo.minting_tx_metadata).forEach(
          ([key, value]: any) => {
            const metadataInfo = value;
            metadata = {
              ...metadata,
              ...metadataInfo,
            };
          }
        ); */
        metadata = extractInnerObject(assetInfo.metadata);
      }

      /* const cases = {
        '2fa3f8b68cd8f4bb95ebc0e24ee5ee7629081e094cab8319caf0453f': {
          '0x53616e64626f785375616e41636365737331': {
            name: 'Token NFT SandBox',
            description: 'NFT con acceso a marketplace en Sandbox',
          },
        },
      };

      const hardTestCase = {
        area: '4990',
        files: [
          {
            src: 'ipfs://QmaLUqr86WwpnSrLwAUVUuWSXzViGsy9uLoUrTJ3ApTq2T',
            mediaType: 'image/png',
          },
        ],
        image: 'ipfs://QmaLUqr86WwpnSrLwAUVUuWSXzViGsy9uLoUrTJ3ApTq2T',
        category: 'MIXTO',
        location: '4.272969755061237, -72.79084537151759 0 0',
        createdAt: '15/12/2023',
        mediaType: 'image/png',
        project_id: '99d0f2a1-61e5-4bf5-b6ef-1f7aea6097c3',
        token_name: 'SUAN-1F7AEA6097C3',
        description: [
          'Este Proyecto está ubicado en la región de la sabana',
          'colombiana conocida como los Llanos Orientales; en un conjunto',
          'de 88 predios que se encuentran ubicados en la región sur del',
          'rio meta, entre los afluentes rio metica y el rio yucao; y',
          'suman un área aproximada de 4.990 Ha, como zona buffer de 100',
          'mts de las rondas hídrica.  Con este proyecto se pretende',
          'aumentar el área de protección mediante regeneración natural',
          'asistida para el establecimiento de especies nativas de la',
          'zona.',
        ],
        project_name: 'Polígono Meta Ecosistemas Estrategicos',
      }; */
      // console.log('hardTestCase', hardTestCase);
      setAssetMetadata(metadata);
      setAssetInfo(assetInfo);

      console.log('AssetInfo obtenido: ', assetInfo);
    };
    if (assetData) {
      handleAssetInfo();
    }
  }, [assetData]);

  return (
    <Modal
      show={openModal}
      onClose={() => handleOpenAssetModal()}
      size="7xl"
      position={'center'}
    >
      <Modal.Body className="bg-custom-dark rounded-lg">
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-custom-fondo text-custom-dark hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-custom-dark font-medium rounded text-sm p-2.5 "
            onClick={() => handleOpenAssetModal()}
          >
            <XIcon />
          </button>
        </div>
        <div className="flex flex-col lg:flex-row text-white rounded-lg p-6 justify-evenly">
          {/* Primera columna (30% de ancho) */}
          <div className="flex flex-col items-center lg:w-30 p-3 pt-10">
            {assetMetadata?.image ? (
              <img
                src={`https://coffee-dry-barnacle-850.mypinata.cloud/ipfs/${
                  assetMetadata?.image
                    ? assetMetadata.image.replace('ipfs://', '')
                    : ''
                }`}
                alt="Asset Image"
                className="w-80 h-auto"
              />
            ) : (
              <div
                role="status"
                className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center"
              >
                <div className="flex items-center justify-center w-80 h-80 bg-gray-300 rounded-full dark:bg-gray-700">
                  <svg
                    className="w-10 h-10 text-gray-200 dark:text-gray-600"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 18"
                  >
                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                  </svg>
                </div>
                <span className="sr-only">Loading...</span>
              </div>
            )}
            <h1 className="text-white text-center my-4 text-2xl">
              {assetData.asset_name}
            </h1>
          </div>
          {/* Segunda columna (70% de ancho) */}
          <div className="lg:w-70 p-3">
            <table className="w-full">
              <tbody className="activos fila_activos">
                <tr className="bg-gray-600">
                  {/* <td>Decimals: </td>
                  <td className="mr-3">{assetData.decimals}</td> */}
                  <td>En billetera: </td>
                  <td>{assetData.quantity}</td>
                  <td>En circulación: </td>
                  <td>
                    {assetInfo.quantity
                      ? assetInfo.quantity
                      : 'Loading ...'}
                  </td>
                </tr>
              </tbody>
            </table>
            <hr className="my-2" />
            <h3 className="font-extrabold">Blockchain Data</h3>
            <div className="relative overflow-x-auto">
              <table className="w-full">
                <tbody className="fila_activos">
                  <tr>
                    <td>Policy ID:</td>
                    <td className="flex">
                      <div className="truncate w-[60%]">
                        {assetData.policy_id}
                      </div>
                      <CopyToClipboard
                        iconClassName="h-5 w-5 ml-2"
                        copyValue={assetData.policy_id}
                        tooltipLabel="Copiar !"
                      />
                    </td>
                  </tr>
                  <tr className="bg-gray-600">
                    <td>Fingerprint:</td>
                    <td className="flex">
                      <div className="truncate w-[60%]">
                        {assetInfo.fingerprint
                          ? assetInfo.fingerprint
                          : 'Loading ...'}
                      </div>
                      <CopyToClipboard
                        iconClassName="h-5 w-5 ml-2"
                        copyValue={assetInfo.fingerprint}
                        tooltipLabel="Copiar !"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Nombre del activo:</td>
                    <td>
                      {assetData.asset_name
                        ? assetData.asset_name
                        : 'Loading ...'}
                    </td>
                  </tr>
                  {/* <tr className="bg-gray-600">
                    <td>Fecha de creación:</td>
                    <td>
                      {assetInfo.creation_time
                        ? getDateFromTimeStamp(assetInfo.creation_time)
                        : 'Loading ...'}
                    </td>
                  </tr> */}
                </tbody>
              </table>
            </div>
            <hr className="my-2" />
            {/* Información adicional: Metadata */}
            <h3 className="font-extrabold">Metadata</h3>
            <div className="relative overflow-x-auto">
              <table className="w-full">
                {assetMetadata ? (
                  <tbody className="fila_activos">
                    {Object.keys(assetMetadata).length > 0
                      ? Object.entries(assetMetadata).map(
                          ([key, value]: any, idx: number) => {
                            if (Array.isArray(value)) {
                              return (
                                <>
                                  <tr>
                                    <td>{key}:</td>
                                  </tr>
                                  {value.map((item: any, index: number) => {
                                    if (typeof item === 'object') {
                                      return Object.entries(item).map(
                                        ([key2, value2]: any) => (
                                          <tr key={key2}>
                                            <td>{'-> ' + key2}</td>
                                            <td>{value2}</td>
                                          </tr>
                                        )
                                      );
                                    } else {
                                      return (
                                        <tr>
                                          <td>{'-> ' + index}</td>
                                          <td>{item}</td>
                                        </tr>
                                      );
                                    }
                                  })}
                                </>
                              );
                            } else {
                              return (
                                <tr
                                  className={`${
                                    idx % 2 === 0 && 'bg-gray-600'
                                  }`}
                                >
                                  <td>{key}</td>
                                  <td>{value}</td>
                                </tr>
                              );
                            }
                          }
                        )
                      : 'No se ha encontrado metadatos'}
                  </tbody>
                ) : (
                  'Loading ...'
                )}
              </table>
            </div>
            <hr className="my-2" />
            {/* Información adicional: Raw JSON */}
            {assetMetadata && Object.keys(assetMetadata).length > 0 && (
              <div className="">
                <h2 className="font-extrabold	">Raw JSON</h2>
                <JsonView
                  data={assetMetadata}
                  shouldExpandNode={allExpanded}
                  style={defaultStyles}
                />
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
