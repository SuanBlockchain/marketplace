import { useEffect, useState } from 'react';
import Link from 'next/link';
import GoogleMapReact from 'google-map-react';
import { Transition } from '@headlessui/react';
import { MyPage } from '@suan/components/common/types';
import { getActualPeriod } from '@suan/utils/generic/getActualPeriod';
import { mapProjectData } from '@suan/lib/mappers';
import dynamic from 'next/dynamic';
import TabsComponents from '@suan/components/home-page/TabsProject';
const FinancialTab = dynamic(
  () => import('@suan/components/home-page/ProjectTabs/FinancialTab')
);
const EarningsTab = dynamic(
  () => import('@suan/components/home-page/ProjectTabs/EarningsTab')
);
const ProjectionsTab = dynamic(
  () => import('@suan/components/home-page/ProjectTabs/ProjectionsTab')
);
import Card from '@marketplaces/ui-lib/src/lib/common/Card';
import PageHeader  from '@marketplaces/ui-lib/src/lib/common/PageHeader';
import { useRouter } from 'next/router';
import { getImagesCategories, getProject, getProjectData } from '@marketplaces/data-access';

const ProjectDataModal = dynamic(
  () => import('@suan/components/modals/ProjectDataModal')
);

const Product: MyPage = (props: any) => {
  const router = useRouter();
  const project = props.project;
  const projectData = props.projectData;
  const imageData = props.image;

  const [availableTokenAmount, setAvailableTokenAmount] = useState<
    number | null
  >(null);

  useEffect(() => {
    const getAvailableTokens = async (
      spendContractAddress: string,
      tokenName: string,
      tokenContractId: string
    ) => {
      const response = await fetch(
        '/api/calls/backend/getWalletBalanceByAddress',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(spendContractAddress),
        }
      );
      const spentWalletData = await response.json();

      console.log('spendData', spentWalletData);

      if (!spentWalletData) {
        console.log('Parece que un error ha ocurrido ...');
      }

      const investorProjectTokensAmount = spentWalletData.assets.reduce(
        (sum: number, item: any) => {
          if (
            item.asset_name === tokenName &&
            item.policy_id === tokenContractId
          ) {
            return sum + parseInt(item.quantity);
          }
        },
        0
      );
      setAvailableTokenAmount(investorProjectTokensAmount);
      return investorProjectTokensAmount;
    };

    // Obtener del endpoint de luis la cantidad de tokens disponibles para comprar
    const mintProjectTokenContract = project.scripts.items.find(
      (script: any) =>
        script.script_type === 'mintProjectToken' && script.Active === true
    );

    console.log('project.scripts', project.scripts);
    console.log('mintProjectTokenContract', mintProjectTokenContract);

    const spendContractFromMintProjectToken = project.scripts.items.find(
      (script: any) => script.script_type === 'spendProject' && script.Active === true
    );

    if (mintProjectTokenContract && spendContractFromMintProjectToken) {
      getAvailableTokens(
        spendContractFromMintProjectToken.testnetAddr,
        mintProjectTokenContract.token_name,
        mintProjectTokenContract.id
      );
    }
  }, []);

  // useEffect(() => {
  //   async function updatePredialData() {
  //     const cadastralNumbersArray =
  //       projectData.projectCadastralRecords.cadastralRecords.map(
  //         (item: any) => item.cadastralNumber
  //       );
  //     const predialData = await getPolygonByCadastralNumber(
  //       cadastralNumbersArray
  //     ); // Llamada a la función getData
  //     console.log('predialData', predialData);
  //     setPolygonsFetchedData(predialData);
  //   }

  //   console.log("projectData", projectData)

  //   updatePredialData();
  // }, [projectData]);

  const tokenName: string =
    project.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_TOKEN_NAME';
    })[0]?.value || '0';

  const tokenHistoricalData = JSON.parse(
    project.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA';
    })[0]?.value || '[]'
  );

  const tokenCurrency: string =
    project.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_TOKEN_CURRENCY';
    })[0]?.value || '';
  const periods = tokenHistoricalData.map((tkhd: any) => {
    return {
      period: tkhd.period,
      date: new Date(tkhd.date),
      price: tkhd.price,
      amount: tkhd.amount,
    };
  });

  const actualPeriod: any = getActualPeriod(Date.now(), periods);
  const totalProjectTokens = periods.reduce(
    (sum: number, item: any) => sum + parseInt(item.amount),
    0
  );
  const totalTokensSold = project.transactions.items.reduce(
    (acc: any, item: any) => {
      return acc + item.amountOfTokens;
    },
    0
  );

  const totalTokensFromFirstToActualPeriod: number = tokenHistoricalData.reduce(
    (acc: any, hd: any) => {
      if (parseInt(hd.period) <= parseInt(actualPeriod.period)) {
        return acc + hd.amount;
      } else {
        return acc;
      }
    },
    0
  );

  const tokenUnits: number = totalProjectTokens - parseInt(totalTokensSold);

  // const tokenUnits: number =
  //   parseInt(actualPeriod?.amount) - parseInt(totalTokensSold);

  const coordString: string =
    project.productFeatures.items.filter((item: any) => {
      return item.featureID === 'C_ubicacion';
    })[0]?.value || '4.708392839967101, -74.06997219191005';
  let coords = coordString.split(' ');
  let lat: number = parseFloat(coords[0]);
  let lng: number = parseFloat(coords[1]);

  const porcentageBuyed: number =
    (parseInt(totalTokensSold) * 100) / tokenUnits;
  const createdAt: any = new Date(project.createdAt);
  const updatedAt: any = new Date(project.updatedAt);

  let relevantInfo = {
    name: project.name,
    dateOfInscription: project.createdAt.split('-')[0],
    category: project.category.name
      .toLowerCase()
      .replace(/(?:^|\s)\S/g, (char: string) => char.toUpperCase()),
    encodedCategory: encodeURIComponent(project.categoryID),
    coordenadas: { lat, lng },
    price: actualPeriod?.price,
    tokenName: tokenName,
    totalTokensFromFirstToActualPeriod: totalTokensFromFirstToActualPeriod,
    tokenTotal: actualPeriod?.amount,
    tokenUnits: availableTokenAmount,
    porcentageBuyed: porcentageBuyed,
    createdAt: createdAt.toLocaleDateString('es-ES'),
    updatedAt: updatedAt.toLocaleDateString('es-ES'),
    tokenCurrency: tokenCurrency,
  };
  const [expanded, setExpanded] = useState(false);
  const [openModal, setOpenModal] = useState('');

  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Financieros', 'Ingresos', 'Proyección'];
  const tabComponents = [TabsComponents, TabsComponents, TabsComponents]; // Importa tus componentes
  const tabProps = [
    {
      title: 'Indicadores Financieros',
      description:
        'Esta sección proporciona una visión integral de la evaluación financiera del proyecto, indicadores esenciales para tomar decisiones informadas sobre la viabilidad y el éxito del proyecto, proporcionando una base sólida para la toma de decisiones estratégicas.',
      content: (
        <FinancialTab
          financialData={
            projectData.projectFinancialInfo.financialIndicators
              .financialIndicators
          }
        />
      ),
    },
    {
      title: 'Ingresos por producto',
      description:
        'Esta sección proporciona una visión integral de la evaluación financiera del proyecto, indicadores esenciales para tomar decisiones informadas sobre la viabilidad y el éxito del proyecto, proporcionando una base sólida para la toma de decisiones estratégicas.',
      content: (
        <EarningsTab
          earningsData={projectData.projectFinancialInfo.revenuesByProduct}
        />
      ),
    },
    {
      title: 'Proyección por proyecto',
      description:
        'Esta sección proporciona una visión integral de la evaluación financiera del proyecto, indicadores esenciales para tomar decisiones informadas sobre la viabilidad y el éxito del proyecto, proporcionando una base sólida para la toma de decisiones estratégicas.',
      content: <ProjectionsTab projectionData={project} />,
    },
  ];

  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  const truncatedDescription =
    project.description?.split(' ').slice(0, 70).join(' ') || '' + '...';
  const fullDescription = project.description;
  return (
    <div className="h-auto w-full p-5">
      <PageHeader imageURL={imageData}></PageHeader>
      <div className="grid grid-cols-2 gap-5">
        {/* Content */}
        <div className="col-span-2 xl:col-span-1">
          <Card>
            <Card.Body>
              <div className="info-title">
                <h3 className="text-xl font-semibold">
                  {relevantInfo.name} |{' '}
                  {relevantInfo.tokenName ? relevantInfo.tokenName : 'ETH'}
                </h3>
              </div>
              {/* Tags */}
              <div className="flex items-center space-x-2 mt-2">
                <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded  border border-gray-500">
                  {relevantInfo.category}
                </span>
                <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded border border-gray-500">
                  {relevantInfo.dateOfInscription}
                </span>
              </div>
              <div className="info-price mt-2">
                <div className="text-4xl font-bold">
                  {parseFloat(relevantInfo.price).toLocaleString('es-CO')}{' '}
                  {relevantInfo.tokenCurrency}
                  <span className="price-span">/ tCO2eq</span>
                </div>
                <div className="description-price">
                  <Transition
                    show={expanded}
                    enter="transition-opacity duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    {(ref) => <p className="md:text-sm">{fullDescription}</p>}
                  </Transition>
                  {!expanded && (
                    <div>
                      <p className="text-xs md:text-sm">
                        {truncatedDescription}
                      </p>
                      {truncatedDescription.length !==
                        fullDescription.length && (
                        <button
                          className="text-[#1E446E] underline text-xs"
                          onClick={toggleExpand}
                        >
                          Leer más
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <button
                  className="flex w-full justify-center text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-5"
                  onClick={() => setOpenModal('projectDataModal')}
                >
                  Detalles del proyecto
                </button>
                <button
                  className="flex w-full justify-center text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-5"
                  onClick={() =>
                    router.push(`/projects/${project.id}/dashboard`)
                  }
                >
                  Dashboard del proyecto
                </button>
                <div className="flex flex-col space-y-2 mt-20">
                  <div className="flex justify-center bg-amber-400 text-sm px-2.5 py-0.5 rounded border border-custom-dark">
                    <p>
                      Tokens disponibles para comprar:{' '}
                      <span className="font-semibold">
                        {relevantInfo.tokenUnits
                          ? `${relevantInfo.tokenUnits.toLocaleString(
                              'es-CO'
                            )} `
                          : '0'}
                      </span>
                    </p>
                  </div>
                  <Link
                    className=" buy-button flex justify-center w-full text-amber-400 bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-lg px-5 py-2.5 "
                    href={`/projects/${project.id}/purchase`}
                  >
                    Ir a comprar !
                  </Link>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Map */}
        <div className="col-span-2 xl:col-span-1 order-first xl:order-none">
          <div className="flex w-full h-300 xl:h-full rounded-lg overflow-hidden border shadow-[rgba(221,222,227,1)_1px_1px_4px_0px] bg-custom-fondo animate-fade animate-ease-in animate-duration-300">
            {projectData.projectPredialGeoJson && (
              <GoogleMapReact
                bootstrapURLKeys={{
                  key: process.env['NEXT_PUBLIC_GMAPS_API_KEY'] || '',
                }}
                defaultCenter={{
                  lat: projectData.projectInfo.location.coords.lat,
                  lng: projectData.projectInfo.location.coords.lng,
                }}
                defaultZoom={12}
                onGoogleApiLoaded={({ map, maps }) => {
                  console.log(
                    projectData.projectPredialGeoJson,
                    'polygonsFetchedData'
                  );

                  if (projectData?.projectPredialGeoJson?.features?.length > 0) {
                    // Load GeoJSON.
                    map.data.addGeoJson(projectData.projectPredialGeoJson);
                    console.log('entro');

                    // Create empty bounds object
                    let bounds = new maps.LatLngBounds();

                    map.data.addListener('click', (event: any) => {
                      const codigo = event.feature.getProperty('CODIGO');
                      console.log('Este es el codigo: ', codigo);
                      const contentString = `
                        <div class='infoWindowContainer'>
                          <p>Identificador catastral: ${codigo}</p>
                        </div>
                      `;

                      let infoWindow = new maps.InfoWindow({
                        content: contentString,
                        ariaLabel: codigo,
                      });
                      //setInfoWindow(infoWindow);
                      infoWindow.setPosition(event.latLng);
                      infoWindow.open(map, event.latLng);
                    });

                    map.data.forEach(function (feature: any) {
                      var geo = feature.getGeometry();

                      geo.forEachLatLng(function (LatLng: any) {
                        bounds.extend(LatLng);
                      });
                    });

                    map.fitBounds(bounds);
                  }
                  // const contentString =
                  //   '<div id="content">' +
                  //   '<div id="siteNotice">' +
                  //   "</div>" +
                  //   '<h1 id="firstHeading" class="firstHeading">Uluru</h1>' +
                  //   '<div id="bodyContent">' +
                  //   "<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large " +
                  //   "sandstone rock formation in the southern part of the " +
                  //   "Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) " +
                  //   "south west of the nearest large town, Alice Springs; 450&#160;km " +
                  //   "(280&#160;mi) by road. Kata Tjuta and Uluru are the two major " +
                  //   "features of the Uluru - Kata Tjuta National Park. Uluru is " +
                  //   "sacred to the Pitjantjatjara and Yankunytjatjara, the " +
                  //   "Aboriginal people of the area. It has many springs, waterholes, " +
                  //   "rock caves and ancient paintings. Uluru is listed as a World " +
                  //   "Heritage Site.</p>" +
                  //   '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' +
                  //   "https://en.wikipedia.org/w/index.php?title=Uluru</a> " +
                  //   "(last visited June 22, 2009).</p>" +
                  //   "</div>" +
                  //   "</div>";

                  // const infowindow = new maps.InfoWindow({
                  //   content: contentString,
                  //   ariaLabel: "Uluru",
                  // });

                  // projectData.projectGeoData.map((geoData: any) => {
                  //   new maps.KmlLayer(geoData.fileURLS3, {
                  //     suppressInfoWindows: true,
                  //     preserveViewport: false,
                  //     map: map,
                  //   }).addListener('click', function (event: any) {});
                  // });
                }}
                yesIWantToUseGoogleMapApiInternals
              ></GoogleMapReact>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="col-span-2">
          <Card>
            <header>
              <ul className="flex text-sm font-medium text-center rounded-t-lg border-b">
                {tabs.map((tab: any, index: number) => {
                  return (
                    <li key={index} className="w-full focus-within:z-10">
                      <button
                        className={`inline-block w-full p-4 border-r border-gray-200 hover:text-gray-700 focus:ring-4 focus:ring-blue-300 focus:outline-none ${
                          activeTab === index
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveTab(index)}
                      >
                        {tab}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </header>
            <Card.Body>
              {tabComponents.map((TabComponent, index) => (
                <div
                  key={index}
                  className={activeTab === index ? '' : 'hidden'}
                >
                  <TabComponent tabData={tabProps[index]} />
                </div>
              ))}
            </Card.Body>
          </Card>
        </div>
      </div>
      {openModal === 'projectDataModal' && (
        <ProjectDataModal
          setOpenModal={setOpenModal}
          projectData={projectData}
          project={project}
        ></ProjectDataModal>
      )}
    </div>
  );
};

export default Product;
Product.Layout = 'Main';

export async function getServerSideProps(context: any) {
  const { projectId } = context.params;

  const project = await getProject(projectId);
  const projectData = await getProjectData(projectId);
  console.log(projectData)
  const mappedProjectdata = await mapProjectData(projectData);
  const image = await getImagesCategories(
    encodeURIComponent(`${project.categoryID}_banner`)
  );
  return {
    props: {
      project: project,
      projectData: mappedProjectdata,
      image: image,
    },
  };
}
