import { useEffect, useState } from 'react';
import { CopyToClipboard } from '../../ui-lib';
import { Pie } from 'react-chartjs-2';
import { Tooltip } from 'react-tooltip';
import ModalTableImages from '../ModalTableImages';
import { BsThreeDotsVertical } from "react-icons/bs";
interface ChartDataItem {
  name: string;
  value: number;
  percentage: number; // Nuevo campo para el porcentaje
}

interface Traducciones {
  [key: string]: string;
}

interface ProjectItemProps {
  project: any;
  handleDistributeTokens: (project: any, tokenName: string) => void;
  handleSendTokensToOwner: (project: any) => void;
  checkOwnerWallet: (project: any) => boolean | string;
  handleModalImages: (id: string, open: boolean) => void; 
}

export default function ProjectItem(props: ProjectItemProps) {
  const {
    project,
    handleDistributeTokens,
    handleSendTokensToOwner,
    checkOwnerWallet,
    handleModalImages
  } = props;
  const [newChartData, setChartData] = useState<ChartDataItem[]>([]);
  const [globalTokenAmount, setGlobalTokenAmount] = useState<number>(0);
  const [mintProjectToken, setMintProjectToken] = useState<any>(null);
  const [spendSwap, setSpendSwap] = useState<any>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [tokenName, setTokenName] = useState<string>('');
  

  useEffect(() => {
    if (project) {
      console.log(project);
      const spendFromProject = project.scripts.items.find(
        (script: any) => script.script_type === 'spendProject'
      );

      const mintProjectTokenFromProject = project.scripts.items.find(
        (script: any) => script.script_type === 'mintProjectToken'
      );

      setSpendSwap(spendFromProject);
      setMintProjectToken(mintProjectTokenFromProject);
      setTokenData(project.tokens.items[0]);
    }
  }, [project]);
  const getTokenAmountDistribution = (productFeatures: any) => {
    const tokenAmountDistribution = JSON.parse(
      productFeatures.items.filter((item: any) => {
        return item.featureID === 'GLOBAL_TOKEN_AMOUNT_DISTRIBUTION';
      })[0]?.value || '{}'
    );

    return tokenAmountDistribution;
  };

  const traducciones: Traducciones = {
    buffer: 'Buffer',
    comunity: 'Comunidad',
    investor: 'Inversionista',
    owner: 'Propietario',
    suan: 'Suan',
  };

  useEffect(() => {
    const globalTokenTotalAmount = getGlobalTokenTotalAmount(project);
    const newData = getNewChartData(project);
    setGlobalTokenAmount(globalTokenTotalAmount);

    if (newData) {
      const chartData = transformDataForChart(newData, globalTokenTotalAmount);
      setChartData(chartData);
    }
  }, []);

  function getGlobalTokenTotalAmount(project: any): number {
    const GLOBAL_TOKEN_TOTAL_AMOUNT = 'GLOBAL_TOKEN_TOTAL_AMOUNT';
    const featureItem = project.productFeatures.items.find(
      (item: any) => item.featureID === GLOBAL_TOKEN_TOTAL_AMOUNT
    );
    return featureItem ? Number(featureItem.value) : 0;
  }

  function getNewChartData(project: any): any {
    return JSON.parse(
      project.productFeatures.items.filter(
        (item: any) => item.featureID === 'GLOBAL_TOKEN_AMOUNT_DISTRIBUTION'
      )[0]?.value || '[]'
    );
  }

  function transformDataForChart(
    data: any,
    totalAmount: number
  ): ChartDataItem[] {
    const dataFormatted = data.map((item: any) => {
      const percentage = (item.CANTIDAD / totalAmount) * 100;
      return {
        name: item.CONCEPTO,
        value: item.CANTIDAD,
        percentage: percentage,
      };
    });
    return dataFormatted;
  }

  const data = {
    labels: newChartData.map((item: ChartDataItem) => item.name),
    datasets: [
      {
        label: 'Tokens repartidos',
        data: newChartData.map((item: ChartDataItem) => item.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.9)',
          'rgba(75, 192, 192, 0.9)',
          'rgba(53, 162, 235, 0.9)',
          'rgba(255, 205, 86, 0.9)',
          'rgba(255, 159, 64, 0.9)',
          'rgba(153, 102, 255, 0.9)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(53, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: 10,
          },
          color: 'white',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            if (context.datasetIndex === 0 && context.dataIndex !== undefined) {
              const dataset = data.datasets[context.datasetIndex];
              const value = dataset.data[context.dataIndex];
              const total = globalTokenAmount;
              const percentage = ((value / total) * 100).toFixed(2);
              return `${label}: ${value} (${percentage}%)`;
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <>
      <div
        className="relative col-span-2 xl:col-span-1 w-full rounded-lg bg-custom-dark p-3"
        key={project.id}
      >
        <div className="flex flex-col justify-center xl:flex-row xl:justify-none p-3 gap-3 items-center">
          <div className="flex-none">
            <div className="relative inline-flex items-center justify-center w-16 h-16 overflow-hidden bg-white rounded-lg">
              <span className="font-medium text-custom-dark">PY</span>
            </div>
          </div>
          <div className="flex-1 text-white text-center xl:text-left">
            <p className="text-xl text-amber-400">{project.name}</p>
            <div className="flex gap-2">
              <p className="flex-1 text-sm truncate w-max-36">
                {project.category.name}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            {project.tokenGenesis && !project.tokenClaimedByOwner && (
              <>
                <button
                  type="button"
                  id={`hint${project.id}`}
                  className={`disabled:opacity-50 text-custom-dark bg-white hover:gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 `}
                  disabled={checkOwnerWallet(project) ? false : true}
                  onClick={() => {
                    handleSendTokensToOwner(project);
                  }}
                >
                  Enviar tokens a propietario
                </button>
                {(checkOwnerWallet(project) ? false : true) && (
                  <Tooltip anchorSelect={`#hint${project.id}`} place="top">
                    El propietario del proyecto no cuenta con una billetera
                  </Tooltip>
                )}
              </>
            )}
            {!project.tokenGenesis && (
              <>
                <button
                  id={`clickable${project.id}`}
                  type="button"
                  className="text-custom-dark bg-white hover:gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 "
                >
                  Distribuir Tokens
                </button>

                <Tooltip anchorSelect={`#clickable${project.id}`} clickable>
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Nombre del token"
                      className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-1`}
                      onInput={(e) => setTokenName(e.currentTarget.value)}
                      value={tokenName}
                    />
                    <button
                      className="col-span-4 sm:col-span-1 bg-amber-400 hover:bg-amber-200 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm text-black px-5 py-2.5 w-full "
                      onClick={() => handleDistributeTokens(project, tokenName)}
                    >
                      Distribuir
                    </button>
                  </div>
                </Tooltip>
              </>
            )}
            <button 
                className="bg-gray-200 hover:bg-gray-300 focus:outline-none font-medium rounded text-sm text-black p-3 ml-2 h-full"
                onClick={() =>{
                  handleModalImages(project.id, true)
                }}
            ><BsThreeDotsVertical /></button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-col sm:flex-row p-3 border-b border-t gap-3">
          {project.tokenGenesis && (
            <div className="flex-1 text-white space-y-2">
              <p className="mb-2 text-amber-400">Token</p>
              <div className="flex mb-0 pb-0">
                <p className="flex-1 text-xs truncate w-max-36 py-1">
                  POLICY ID: <span>{tokenData?.id}</span>
                </p>
                <div className="flex-none">
                  <CopyToClipboard
                    iconClassName="h-4 w-4"
                    copyValue={tokenData?.id}
                    tooltipLabel="Copiar !"
                  />
                </div>
              </div>
              <p className="flex-1 text-xs py-1">
                NOMBRE: <span>{tokenData?.tokenName}</span>
              </p>
              <p className="flex-1 text-xs py-1">
                CANTIDAD: <span>{tokenData?.supply}</span>
              </p>
              <p className="flex-1 text-xs py-1">
                PRECIO:{' '}
                <span>
                  ₳ {(tokenData?.oraclePrice / 1000000).toLocaleString('es-CO')}
                </span>
              </p>
            </div>
          )}
          <div className="flex-1 text-white">
            <p className="mb-2 text-amber-400">Distribución StakeHolders</p>
            <div className={`flex items-center w-full justify-center`}>
              <div
                className={`${
                  project.tokenGenesis ? 'h-64 w-64' : 'h-80 w-80'
                }`}
              >
                <Pie data={data} options={options} />
              </div>
            </div>
          </div>
        </div>
        {project.tokenGenesis && (
          <div className="flex flex-col md:flex-row items-center p-3 border-b gap-3">
            <div className="flex-1 text-white mb-3 xl:mb-0 w-full">
              <p className="mb-2 text-amber-400">Contrato de distribución</p>
              <div className="flex gap-2">
                <p className="flex-1 text-xs truncate w-36">
                  POLICY ID: <span>{mintProjectToken?.id}</span>
                </p>
                <div className="flex-none">
                  <CopyToClipboard
                    iconClassName="h-4 w-4"
                    copyValue={mintProjectToken?.id}
                    tooltipLabel="Copiar !"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <p className="flex-1 text-xs truncate w-36">
                  PBK: <span>{mintProjectToken?.pbk}</span>
                </p>
                <div className="flex-none">
                  <CopyToClipboard
                    iconClassName="h-4 w-4"
                    copyValue={mintProjectToken?.pbk}
                    tooltipLabel="Copiar !"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <p className="flex-1 text-xs truncate w-36">
                  ADDRESS: <span>{mintProjectToken?.testnetAddr}</span>
                </p>
                <div className="flex-none">
                  <CopyToClipboard
                    iconClassName="h-4 w-4"
                    copyValue={mintProjectToken?.testnetAddr}
                    tooltipLabel="Copiar !"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 text-white w-full">
              <p className="mb-2 text-amber-400">Contrato de intercambio</p>
              <div className="flex gap-2">
                <p className="flex-1 text-xs truncate w-36">
                  POLICY ID: <span>{spendSwap?.id}</span>
                </p>
                <div className="flex-none">
                  <CopyToClipboard
                    iconClassName="h-4 w-4"
                    copyValue={spendSwap?.id}
                    tooltipLabel="Copiar !"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <p className="flex-1 text-xs truncate w-36">
                  PBK: <span>{spendSwap?.pbk}</span>
                </p>
                <div className="flex-none">
                  <CopyToClipboard
                    iconClassName="h-4 w-4"
                    copyValue={spendSwap?.pbk}
                    tooltipLabel="Copiar !"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <p className="flex-1 text-xs truncate w-36">
                  ADDRESS: <span>{spendSwap?.testnetAddr}</span>
                </p>
                <div className="flex-none">
                  <CopyToClipboard
                    iconClassName="h-4 w-4"
                    copyValue={spendSwap?.testnetAddr}
                    tooltipLabel="Copiar !"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
