import {
  getActualPeriod,
  mapBuildTransactionInfo,
  WalletContext,
} from '@marketplaces/utils-2';
import { getAllProjects } from '@marketplaces/data-access';
import ProjectItem from './ProjectItem';
import { useContext, useEffect, useState } from 'react';
import { Card, SignTransactionModal } from '../../ui-lib';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { getIpfsUrlHash } from '@suan/utils/generic/ipfs';
import { splitLongValues } from '@suan/utils/generic/conversions';

interface ProjectContractsProps {
  mintContract: any;
  spendContract: any;
  utxoToSpend: string;
}

export default function Projects(props: any) {
  const { walletID, walletAddress, walletData } =
    useContext<any>(WalletContext);
  const [projectList, setProjectList] = useState<any>(null);
  const [projectListFiltered, setProjectListFiltered] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('Distribuidos');
  const [signTransactionModal, setSignTransactionModal] = useState(false);
  const [newTransactionBuild, setNewTransactionBuild] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function fetchProjects() {
    const projects = await getAllProjects(
      process.env['NEXT_PUBLIC_MARKETPLACE_NAME']
    );
    console.log('projects', projects);
    setProjectList(projects);
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenSignTransactionModal = () => {
    setSignTransactionModal(!signTransactionModal);
  };

  useEffect(() => {
    if (projectList) {
      if (activeTab === 'Distribuidos') {
        const projectsFiltered = projectList.filter(
          (project: any) => project.tokenGenesis === true
        );
        setProjectListFiltered(projectsFiltered);
      }
      if (activeTab === 'Sin distribuir') {
        console.log('este es: ', projectList);
        const projectsFiltered = projectList.filter(
          (project: any) =>
            project.tokenGenesis === false || project.tokenGenesis === null
        );
        setProjectListFiltered(projectsFiltered);
      }
    }
  }, [activeTab, projectList]);

  const getProjectTokenDistribution = (projectData: any) => {
    const productFeatures = projectData.productFeatures.items;
    if (productFeatures) {
      const tokenAmountDistribution = JSON.parse(
        productFeatures.filter((item: any) => {
          return item.featureID === 'GLOBAL_TOKEN_AMOUNT_DISTRIBUTION';
        })[0]?.value || '{}'
      );

      return tokenAmountDistribution;
    } else {
      return false;
    }
  };

  const checkOwnerWallet = (projectData: any) => {
    const constructorUser = projectData.userProducts.items.find(
      (item: any) => item.user.role === 'constructor'
    );

    if (constructorUser) {
      const { wallets } = constructorUser.user;
      if (wallets.items.length > 0) {
        return wallets.items[0].address;
      }
    }

    const marketplaceName =
      process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'Marketplace';
    const marketplaceColors: Record<
      string,
      {
        bgColor: string;
        hoverBgColor: string;
        bgColorAlternativo: string;
        fuente: string;
        fuenteAlterna: string;
      }
    > = {
      Terrasacha: {
        bgColor: 'bg-custom-marca-boton',
        hoverBgColor: 'hover:bg-custom-marca-boton-variante',
        bgColorAlternativo: 'bg-custom-marca-boton-alterno2',
        fuente: 'font-jostBold',
        fuenteAlterna: 'font-jostRegular',
      },

      // Agrega más marketplaces y colores aquí
    };
    const colors = marketplaceColors[marketplaceName] || {
      bgColor: 'bg-custom-dark',
      hoverBgColor: 'hover:bg-custom-dark-hover',
      bgColorAlternativo: 'bg-amber-400',
      fuente: 'font-semibold',
      fuenteAlterna: 'font-medium',
    };

    return false;
  };

  const getRates = async () => {
    const response = await fetch('/api/calls/getRates');
    const data = await response.json();
    let dataFormatted: any = {};
    data.map((item: any) => {
      let obj = `ADArate${item.currency}`;
      dataFormatted[obj] = item.value;
    });
    return dataFormatted;
  };

  const getProjectTokenData = (projectData: any) => {
    const productFeatures = projectData.productFeatures.items;
    if (productFeatures) {
      const tokenCurrency =
        productFeatures.find((item: any) => {
          return item.featureID === 'GLOBAL_TOKEN_CURRENCY';
        })?.value || '{}';

      const tokenHistoricalData: any[] = JSON.parse(
        productFeatures.filter((item: any) => {
          return item.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA';
        })[0]?.value || '[]'
      );

      const periods: any[] = tokenHistoricalData.map((tkhd: any) => {
        return {
          period: tkhd.period,
          date: new Date(tkhd.date),
          price: tkhd.price,
          amount: tkhd.amount,
        };
      });

      const actualPeriod: any = getActualPeriod(Date.now(), periods);

      return {
        actualTokenPrice: actualPeriod.price,
        tokenCurrency: tokenCurrency,
      };
    }
    return {
      actualTokenPrice: null,
      tokenCurrency: null,
    };
  };

  const getTokenLovelacePrice = async (projectData: any) => {
    const rates = await getRates();

    const { actualTokenPrice, tokenCurrency } =
      getProjectTokenData(projectData);

    const currencyToCryptoRate = parseFloat(
      rates[`ADArate${tokenCurrency.toUpperCase()}`]
    );

    if (actualTokenPrice && tokenCurrency && currencyToCryptoRate) {
      console.log('actualTokenPrice', actualTokenPrice);
      console.log('tokenCurrency', tokenCurrency);
      console.log('currencyToCryptoRate', currencyToCryptoRate);
      const adaTokenPrice = parseFloat(actualTokenPrice) / currencyToCryptoRate;
      console.log('adaTokenPrice', adaTokenPrice);
      return Math.trunc(adaTokenPrice * 1000000);
    }

    return false;
  };

  const getProjectLocation = (projectData: any) => {
    const productFeatures = projectData.productFeatures.items;
    if (productFeatures) {
      const projectLocation =
        productFeatures.find((item: any) => {
          return item.featureID === 'C_ubicacion';
        })?.value || '';

      return projectLocation;
    } else {
      return false;
    }
  };

  const getProjectArea = (projectData: any) => {
    const productFeatures = projectData.productFeatures.items;
    if (productFeatures) {
      const projectArea =
        productFeatures.find((item: any) => {
          return item.featureID === 'D_area';
        })?.value || '';

      return projectArea;
    } else {
      return false;
    }
  };

  const getCoreWallet = async () => {
    const response = await fetch('/api/calls/getCoreWallet');
    const data = await response.json();
    console.log('coreWallet', data);
    return data;
  };

  const toPascalCase = (str: string) => {
    return str
      .split(' ') // Divide el string en palabras
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Convierte la primera letra a mayúscula y el resto a minúscula
      .join(''); // Une las palabras sin espacios
  };

  const handleCreateProjectContracts = async (
    project: any,
    tokenName: string
  ) => {
    if (project.scripts.items.length > 0) {
      toast.error('El token ya tiene contratos asociados.');
      return;
    }

    const mintProjectTokenPayload = {
      script_type: 'mintProjectToken',
      name: `${toPascalCase(project.name)}MintContract`,
      wallet_id: walletID,
      tokenName: tokenName,
      save_flag: true,
      project_id: `${project.id}`,
    };
    console.log(mintProjectTokenPayload);

    const response = await fetch('/api/contracts/create-contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mintProjectTokenPayload),
    });
    const createdMintProjectTokenContract = await response.json();

    if (!createdMintProjectTokenContract?.success) {
      toast.error('Ha ocurrido un error, intenta nuevamente ...');
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `Something went wrong!, ${createdMintProjectTokenContract.msg}`,
      });
      return;
    }
    toast.success('Se ha creado el contrato mint exitosamente ...');

    const spendProjectPayload = {
      script_type: 'spendProject',
      name: `${toPascalCase(project.name)}SpendContract`,
      wallet_id: walletID,
      save_flag: true,
      project_id: project.id,
      tokenName: tokenName,
      parent_policy_id: createdMintProjectTokenContract.data.id,
      oracle_wallet_name:
        `${process.env['NEXT_PUBLIC_MARKETPLACE_NAME']}ORACLE${process.env['NEXT_PUBLIC_ENV']}`.toUpperCase(),
    };

    const response2 = await fetch('/api/contracts/create-contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(spendProjectPayload),
    });
    const createdSpendContract = await response2.json();

    if (!createdSpendContract?.success) {
      toast.error('Ha ocurrido un error, intenta nuevamente ...');
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `Something went wrong!, ${createdSpendContract.msg}`,
      });
      return;
    }
    toast.success('Se ha creado el contrato Spend exitosamente ...');

    return {
      mintContract: {
        id: createdMintProjectTokenContract.data.id,
        testnetAddr: createdMintProjectTokenContract.data.testnet_address, // Debe manejarse el caso cuando el ambiente es prod o dev
      },
      spendContract: {
        id: createdSpendContract.data.id,
        testnetAddr: createdSpendContract.data.testnet_address,
      },
      utxoToSpend: createdMintProjectTokenContract.data.utxo_to_spend,
    };
  };

  function fixAddressArray(
    data: any,
    targetAddress: string,
    tokenName: string
  ) {
    let newEntries = [];

    for (let entry of data) {
      if (entry.address === targetAddress) {
        for (let asset of entry.multiAsset) {
          if (asset.tokens && asset.tokens[tokenName]) {
            // Obtener el valor del token
            let originalValue = asset.tokens[tokenName];
            // Calcular un cuarto del valor
            let quarterValue = Math.floor(originalValue / 4);
            // Asignar el primer cuarto al valor original
            asset.tokens[tokenName] = quarterValue;
            // Crear tres nuevos elementos con los otros tres cuartos
            let newAsset1 = {
              policyid: asset.policyid,
              tokens: {
                [tokenName]: quarterValue,
              },
            };
            let newAsset2 = {
              policyid: asset.policyid,
              tokens: {
                [tokenName]: quarterValue,
              },
            };
            let newAsset3 = {
              policyid: asset.policyid,
              tokens: {
                [tokenName]: originalValue - 3 * quarterValue,
              },
            };
            // Clonar el objeto de entrada original tres veces y modificar la cantidad del token
            let newEntry1 = JSON.parse(JSON.stringify(entry));
            newEntry1.multiAsset[0].tokens[tokenName] =
              newAsset1.tokens[tokenName];

            let newEntry2 = JSON.parse(JSON.stringify(entry));
            newEntry2.multiAsset[0].tokens[tokenName] =
              newAsset2.tokens[tokenName];

            let newEntry3 = JSON.parse(JSON.stringify(entry));
            newEntry3.multiAsset[0].tokens[tokenName] =
              newAsset3.tokens[tokenName];

            // Añadir las nuevas entradas al array de nuevos elementos
            newEntries.push(newEntry1, newEntry2, newEntry3);
            break;
          }
        }
        break;
      }
    }
    // Añadir las nuevas entradas al array original de datos
    data.push(...newEntries);
    return data;
  }

  const validateTokenName = (tokenName: string) => {
    if (tokenName.trim() === '') {
      toast.warning('Complete los campos oblgiatorios poder continuar ...');
      return false;
    }

    if (tokenName.trim().length > 50) {
      toast.warning('El nombre del token no puede tener más de 50 caracteres.');
      return false;
    }

    return true;
  };

  const tokenMintAndDistribution = async (
    projectContracts: ProjectContractsProps,
    project: any,
    tokenName: string
  ) => {
    const { mintContract, spendContract } = projectContracts;

    // Obtener corewallet
    const coreWallet = await getCoreWallet();

    let mapStakeHolders: any = {
      bioc: 'addr_test1vqx420pm9cx326rh0q8yx6u4h72ae56l9ekzk05m8w9qe3cz5swj5',
      administrador: coreWallet.address, // Addres de billetera unica tipo corewallet
      inversionista: spendContract.testnetAddr,
      buffer: 'addr_test1vqs34z4ljy3c6u3s97m64zqz7f0ks6vtre2dcpl5um8wz2qgaxq8z',
      comunidad:
        'addr_test1vqvx6mm487nkkpavyf7sqflgavutajq8veer5wmy0nwlgyg27rsqk',
      // propietario: ...
    };

    if (project.tokenGenesis) {
      toast.error('El token ya habia sido distribuido anteriormente.');
      return false;
    }

    const stakeHoldersDistribution = getProjectTokenDistribution(project);
    const ownerWallet = checkOwnerWallet(project);
    const tokenPrice = await getTokenLovelacePrice(project);

    if (!tokenPrice) {
      toast.error('Error calculando el precio del token');
      return false;
    }

    if (ownerWallet) {
      mapStakeHolders.propietario = ownerWallet;
    }

    const tokenToDistributeSum = stakeHoldersDistribution.reduce(
      (sum: number, item: any) => sum + parseInt(item.CANTIDAD),
      0
    );
    let addresses: Array<any> = [];

    let marketplaceTokensAmount;

    if (stakeHoldersDistribution) {
      console.log(Object.keys(mapStakeHolders));
      Object.keys(mapStakeHolders).forEach((stakeHolder: string) => {
        let amountOfTokens = parseInt(
          stakeHoldersDistribution.find(
            (stakeHolderDis: any) =>
              stakeHolderDis.CONCEPTO.toLowerCase() === stakeHolder
          )?.CANTIDAD
        );

        if (stakeHolder === 'inversionista') {
          marketplaceTokensAmount = amountOfTokens;
        }

        if (stakeHolder === 'administrador' && !ownerWallet) {
          const ownerAmountOfTokens = parseInt(
            stakeHoldersDistribution.find(
              (stakeHolderDis: any) =>
                stakeHolderDis.CONCEPTO.toLowerCase() === 'propietario'
            )?.CANTIDAD
          );
          amountOfTokens = amountOfTokens + ownerAmountOfTokens;
        }

        if (amountOfTokens) {
          const address: any = {
            address: mapStakeHolders[stakeHolder],
            lovelace: 0,
            multiAsset: [
              {
                policyid: mintContract.id,
                tokens: {
                  [tokenName]: amountOfTokens,
                },
              },
            ],
          };
          if (stakeHolder === 'inversionista') {
            address.datum = {
              beneficiary: coreWallet.id,
            };
          }
          addresses.push(address);
        }
      });

      console.log('addresses', addresses);
      const newAddressArray = fixAddressArray(
        addresses,
        mapStakeHolders.inversionista,
        tokenName
      );
      console.log('newAddressArray', newAddressArray);
    }

    // Get category image from IPFS

    const IPFSUrlHash = getIpfsUrlHash('REDD+');
    const tokenImageUrl = `ipfs://${IPFSUrlHash}`;

    // Get Area & location (Hace falta trabajar sobre el seteo de estos datos en Plataforma)
    // Area debe calcularse nuevamente al agregar o quitar predio
    // Ubicación debe calcularse con base al centroide generado por los predios al agregar o quitar predio
    const projectArea = getProjectArea(project);
    const projectLocation = getProjectLocation(project);

    const metadata = {
      'Nombre del token': tokenName,
      'Identificador del proyecto': project.id,
      'Nombre del proyecto': project.name,
      Area: projectArea, // Tarea: almacenar dato de area
      Categoria: project.categoryID,
      'Fecha de creación': project.createdAt,
      Descripción: project.description,
      //Ubicación: '0 0 0 0', // Tarea: almacenar coordenadas de centroide
      files: [
        {
          src: tokenImageUrl,
          mediaType: 'image/png',
        },
      ],
      image: tokenImageUrl,
      mediaType: 'image/png',
    };

    console.log('metadata', metadata);
    const truncated_metadata = splitLongValues(metadata);
    console.log('truncated_metadata', truncated_metadata);

    const payload = {
      mint_redeemer: 'Mint',
      payload: {
        wallet_id: walletID,
        utxo: projectContracts.utxoToSpend,
        addresses: addresses,
        mint: {
          asset: {
            policyid: mintContract.id,
            tokens: {
              [tokenName]: tokenToDistributeSum,
            },
          },
        },
        metadata: {
          '721': truncated_metadata,
        },
      },
      transactionPayload: {
        walletID: walletID,
        walletAddress: walletAddress,
        productID: project.id,
      },
    };

    console.log('payload', payload);
    const response = await fetch('/api/transactions/mint-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const buildTxResponse = await response.json();

    if (buildTxResponse?.success) {
      const mappedTransactionData = await mapBuildTransactionInfo({
        tx_type: 'preview',
        walletAddress: walletAddress,
        buildTxResponse: buildTxResponse,
        metadata: truncated_metadata,
      });

      const postDistributionPayload = {
        scriptId: mintContract.id,
        updateProduct: {
          id: project.id,
          tokenClaimedByOwner: ownerWallet ? true : false,
          tokenGenesis: true,
        },
        createToken: {
          tokenName: tokenName,
          supply: marketplaceTokensAmount,
          productID: project.id,
          policyID: mintContract.id,
          oraclePrice: 0,
        },
        /* createOracleDatum: {
          action: 'Update',
          master_wallet_id:
            '575a7f01272dd95a9ba2696e9e3d4895fe39b12350f7fa88a301b3ad',
          oracle_wallet_name: 'SuanOracle',
          payload: {
            data: [
              {
                policy_id: mintContract.id,
                token: tokenName,
                price: tokenPrice,
              },
            ],
            validity: 86400000,
          },
        }, */
      };

      setNewTransactionBuild({
        ...mappedTransactionData,
        scriptId: mintContract.id,
        postDistributionPayload,
        transaction_id: buildTxResponse.transaction_id,
      });
      handleOpenSignTransactionModal();
    } else {
      toast.error('Ha ocurrido un error, intenta nuevamente ...');
    }
  };

  const handleDistributeTokens = async (project: any, tokenName: string) => {
    const isValidTokenName = validateTokenName(tokenName);

    if (!isValidTokenName) {
      return;
    }

    setIsLoading(true);
    const projectContracts = await handleCreateProjectContracts(
      project,
      tokenName
    );

    if (!projectContracts) {
      setIsLoading(false);
      return;
    }

    await tokenMintAndDistribution(projectContracts, project, tokenName);

    setIsLoading(false);
  };

  const handleSendTokensToOwner = async (project: any) => {
    const ownerWallet = checkOwnerWallet(project);
    const stakeHoldersDistribution = getProjectTokenDistribution(project);

    console.log(stakeHoldersDistribution);
    const ownerAmountOfTokens =
      parseInt(
        stakeHoldersDistribution.find(
          (stakeHolderDis: any) =>
            stakeHolderDis.CONCEPTO.toLowerCase() === 'propietario'
        )?.CANTIDAD
      ) || null;

    const mintContract =
      project.scripts.items.find(
        (script: any) =>
          script.script_type === 'mintProjectToken' && script.Active === true
      ) || null;

    if (!mintContract) {
      toast.error('No se ha encontrado contrato MINT');
      return;
    }

    if (!ownerAmountOfTokens) {
      toast.error('El participante del proyecto no esta definido');
      return;
    }
    if (!ownerWallet) {
      toast.error(
        'El propietario del proyecto no posee una billetera asociada a su cuenta'
      );
      return;
    }

    const payload = {
      payload: {
        wallet_id: walletID,
        addresses: [
          {
            address: ownerWallet, // Address billetera Owner
            lovelace: 0,
            multiAsset: [
              {
                policyid: mintContract.id,
                tokens: {
                  [mintContract.token_name]: ownerAmountOfTokens,
                },
              },
            ],
          },
        ],
        metadata: {},
      },
      transactionPayload: {
        walletID: walletID,
        walletAddress: walletAddress,
      },
    };
    if (walletData) {
      console.log('BuildTx Payload: ', payload);

      const request = await fetch('/api/transactions/build-tx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const buildTxResponse = await request.json();
      console.log('BuildTx Response: ', buildTxResponse);

      if (buildTxResponse?.success) {
        const mappedTransactionData = await mapBuildTransactionInfo({
          tx_type: 'preview',
          walletAddress: walletData.address,
          buildTxResponse: buildTxResponse,
          metadata: {},
        });

        setNewTransactionBuild({
          ...mappedTransactionData,
          transaction_id: buildTxResponse.transaction_id,
        });
        handleOpenSignTransactionModal();
      } else {
        toast.error(
          'Algo ha salido mal, revisa las direcciones de billetera ...'
        );
      }
    }
  };
  const marketplaceName =
    process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'Marketplace';
  const marketplaceColors: Record<
    string,
    {
      bgColor: string;
      hoverBgColor: string;
      bgColorAlternativo: string;
      fuente: string;
      fuenteAlterna: string;
      fuenteVariante: string;
    }
  > = {
    Terrasacha: {
      bgColor: 'bg-custom-marca-boton',
      hoverBgColor: 'hover:bg-custom-marca-boton-variante',
      bgColorAlternativo: 'bg-custom-marca-boton-alterno2',
      fuente: 'font-jostBold',
      fuenteAlterna: 'font-jostRegular',
      fuenteVariante: 'font-jostItalic',
    },

    // Agrega más marketplaces y colores aquí
  };
  const colors = marketplaceColors[marketplaceName] || {
    bgColor: 'bg-custom-dark',
    hoverBgColor: 'hover:bg-custom-dark-hover',
    bgColorAlternativo: 'bg-amber-400',
    fuente: 'font-semibold',
    fuenteAlterna: 'font-medium',
    fuenteVariante: 'font-normal',
  };
  return (
    <>
      <div className={`${colors.fuenteAlterna} `}>
        <Card className="h-fit mt-6">
          <Card.Header title="Gestión de Proyectos" />
          <Card.Body>
            <ul
              className={`bg-custom-dark flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400 mb-2 rounded-lg`}
            >
              <li className="me-2">
                <button
                  onClick={() => setActiveTab('Distribuidos')}
                  className={`${
                    colors.fuente
                  } inline-block px-4 py-3 rounded-lg ${
                    activeTab === 'Distribuidos'
                      ? `${colors.bgColor} text-white`
                      : `${colors.hoverBgColor} text-white`
                  }`}
                  aria-current="page"
                >
                  Distribuidos
                </button>
              </li>
              <li className="me-2">
                <button
                  onClick={() => setActiveTab('Sin distribuir')}
                  className={`${
                    colors.fuente
                  } inline-block px-4 py-3 rounded-lg  ${
                    activeTab === 'Sin distribuir'
                      ? `${colors.bgColor} text-white`
                      : `${colors.hoverBgColor} text-white`
                  }`}
                >
                  Sin distribuir
                </button>
              </li>
            </ul>
            <div className="grid grid-cols-2 gap-2">
              {projectListFiltered && projectListFiltered.length > 0 ? (
                projectListFiltered.map((project: any) => (
                  <ProjectItem
                    project={project}
                    key={project.id}
                    handleDistributeTokens={handleDistributeTokens}
                    handleSendTokensToOwner={handleSendTokensToOwner}
                    checkOwnerWallet={checkOwnerWallet}
                  />
                ))
              ) : (
                <div className="flex col-span-2 items-center justify-center h-52">
                  No se han encontrado proyectos pendientes por distribuir
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
      <div className="mt-6">
        {' '}
        {/* Este margen agrega el espacio después del Card */}
        {/* Contenido adicional */}
      </div>
      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType="distributeTokens"
      />
    </>
  );
}
