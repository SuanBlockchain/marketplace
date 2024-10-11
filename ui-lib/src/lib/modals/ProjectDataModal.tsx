import { useState } from "react";
import GoogleMapReact from "google-map-react";
import { Modal, Tabs, Badge, Label, TextInput } from "flowbite-react";
import ProjectInfoCard from "../projectData/ProjectInfoCard";
import OwnerInfoCard from "../projectData/OwnerInfoCard";
import PostulantInfoCard from "../projectData/PostulantInfoCard";
import ActualUseAndPotentialInfoCard from "../projectData/ActualUseAndPotentialInfoCard";
import UserRestrictionsInfoCard from "../projectData/UseRestrictionsInfoCard";
import EcosystemInfoCard from "../projectData/EcosystemInfoCard";
import PropertyInfoCard from "../projectData/PropertyInfoCard";
import RelationsInfoCard from "../projectData/RelationsInfoCard";
import ProjectFilesInfoCard from "../projectData/ProjectFiltesInfoCard";
import ProductsOfCycleProject from "../projectData/ProductsOfCycleProject";
import IncomeByProduct from "../projectData/IncomeByProduct";
import CashFlowResume from "../projectData/CashFlowResume";
import BlockchainCard from "../projectData/BlockchainCards";
import OwnersDataVerification from "../projectData/OwnersDataVerification";
import Link from "next/link";

export default function ProjectDataModal({
  openModal,
  setOpenModal,
  projectData,
  project,
}: any) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Detalles", /* "Galeria", */ "Archivos", "Blockchain", "Finanzas"];
  const tabComponents = [
    TabDetalles,
    /* TabGaleria, */
    TabArchivos,
    TabBlockchain,
    TabFinanzas,
  ];
  
  const renderFileLinkByDocumentID = (documentID: any) => {
    if (documentID) {
      const document = projectData.projectFiles.find(
        (item:any) => item.id === documentID
      );
      return (
        <Link href={document?.url} target="_blank" rel="noreferrer" className="underline">
          Archivo
        </Link>
      );
    } else {
      return "Sin archivo";
    }
  };
  console.log(projectData)
  return (
    <Modal
      show={openModal === "projectDataModal"}
      onClose={() => setOpenModal(undefined)}
      size="6xl"
      className="modal-detail"
    >
      <Modal.Header className="mx-10 pl-11 pt-8 border-b-0">
        Información del proyecto
      </Modal.Header>
      <Modal.Body className="overflow-y-auto">
        <div className="sm:mx-8 sm:px-8 mx-2 px-2">
          <p className="modal-name text-2xl text-[#2E7D96]">
            {projectData.projectInfo.title}{" "}
          </p>
          <p className="modal-date text-[#484848]">
            Fecha de creación: <span>{projectData.projectInfo.createdAt}</span>
          </p>
          <p className="modal-description text-[#484848] mt-2">
            {projectData.projectInfo.description}{" "}
          </p>
          {projectData.projectVerifierNames?.length > 0 && (
            <section className="mb-8">
              <p className="modal-validadores mt-4 text-[#484848]">
                Validadores:
              </p>
              <div className="flex gap-x-2 mt-2 flex-col sm:flex-row">
                {projectData.projectVerifierNames?.map(
                  (pvn: any, index: number) => {
                    return (
                      <Badge
                        key={index}
                        color="success"
                        className="modal-validador text-[#2E7D96] bg-[#D6F8F4] py-1 px-4"
                      >
                        {/* Validador {index + 1}: {pvn} */}
                        {pvn}
                      </Badge>
                    );
                  }
                )}
              </div>
            </section>
          )}

          <div className="border-t border-1 w-11/12 "></div>
          <div className="detail-tabs">
            <div className="detail-div border-[#ABABAB] flex justify-center">
              <div className="tabs mt-2 pt-2 flex sm:flex-row flex-col w-full">
                {tabs.map((tab, index) => (
                  <button
                    key={index}
                    className={`tabs-title sm:m-2 my-1 border rounded-lg text-[#2E2F30] py-2 px-10 border-[#D9D9D9] w-full hover:bg-[#1F0004] ${
                      activeTab === index
                        ? "border-b-2 border-[#1F0004] text-[#FFF] bg-[#6C000D] font-bold"
                        : "bg-[#D9D9D9] font-semibold border-b-2 border-transparent "
                    }`}
                    onClick={() => setActiveTab(index)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:tab-component sm:p-8 p-2 rounded-lg bg-[#FFF]">
              {tabComponents.map((TabComponent, index) => (
                <div
                  key={index}
                  className={activeTab === index ? "" : "hidden"}
                >
                  <TabComponent />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );

  function TabDetalles() {
    return (
      <div className="sm:grid sm:grid-cols-1 sm:gap-4">
        <div className="bg-[#F4F8F9] rounded-lg">
          <ProjectInfoCard
            title={projectData.projectInfo.title}
            description={projectData.projectInfo.description}
            area={projectData.projectInfo.area}
            category={projectData.projectInfo.category}
            vereda={projectData.projectInfo.location.vereda}
            municipio={projectData.projectInfo.location.municipio}
            matricula={projectData.projectInfo.location.matricula}
            fichaCatrastal={projectData.projectInfo.location.fichaCatrastal}
          />
          <div className="mapa sm:mx-4 sm:p-6">
            <GoogleMapReact
              bootstrapURLKeys={{
                key: "AIzaSyCzXTla3o3V7o72HS_mvJfpVaIcglon38U",
              }}
              defaultCenter={{
                lat: projectData.projectInfo.location.coords.lat,
                lng: projectData.projectInfo.location.coords.lng,
              }}
              defaultZoom={12}
              onGoogleApiLoaded={({ map, maps }) => {
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

                projectData.projectGeoData.map((geoData: any) => {
                  new maps.KmlLayer(geoData.fileURLS3, {
                    suppressInfoWindows: true,
                    preserveViewport: false,
                    map: map,
                  }).addListener("click", function (event: any) {});
                });
              }}
              yesIWantToUseGoogleMapApiInternals
            ></GoogleMapReact>
          </div>
        </div>
        <div className="bg-[#F4F8F9] rounded-lg">
          <OwnerInfoCard
            owners={projectData.projectOwners.owners}
          />
        </div>
        {/* <div className="bg-[#F4F8F9] rounded-lg">
          <PostulantInfoCard
            name={projectData.projectPostulant.name}
            email={projectData.projectPostulant.email}
            docType={projectData.projectPostulant.docType}
            docNumber={projectData.projectPostulant.docNumber}
          />
        </div> */}
        <div className="bg-[#F4F8F9] rounded-lg">
          <ActualUseAndPotentialInfoCard
            actualUse={projectData.projectUses.actualUse}
            replaceUse={projectData.projectUses.replaceUse}
          />
        </div>
        <div className="bg-[#F4F8F9] rounded-lg">
          <UserRestrictionsInfoCard
            description={projectData.projectRestrictions.desc}
            other={projectData.projectRestrictions.other}
          />
        </div>
        <div className="bg-[#F4F8F9] rounded-lg">
          <EcosystemInfoCard projectEcosystem={projectData.projectEcosystem} />
        </div>
        <div className="bg-[#F4F8F9] rounded-lg">
          <PropertyInfoCard
            projectGeneralAspects={projectData.projectGeneralAspects}
          />
        </div>
        <div className="bg-[#F4F8F9] rounded-lg">
          <RelationsInfoCard projectRelations={projectData.projectRelations} />
        </div>
      </div>
    );
  }

  function TabGaleria() {
    return (
      <div className="flex justify-center border p-5">
        No se ha subido información
      </div>
    );
  }

  function TabArchivos() {
    return (
      <ProjectFilesInfoCard
        projectFiles={projectData.projectFilesValidators.projectValidatorDocuments.filter(
          (vd: any) => vd.visible === true
        )}
      />
    );
  }

  function TabBlockchain() {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-1">
        <BlockchainCard project={project} />

        {/* <OwnersDataVerification
          projectOwnersData={projectData.projectOwners.owners}
          renderFileLinkByDocumentID={renderFileLinkByDocumentID}
          projectID={projectData.projectInfo.id}
        /> */}
      </div>
    );
  }

  function TabFinanzas() {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-1 ">
        <div className="bg-[#F4F8F9] rounded-lg mb-2">
          <IncomeByProduct
            projectFinancialInfo={
              projectData.projectFinancialInfo.revenuesByProduct
            }
          />
        </div>
        <div className="bg-[#F4F8F9] rounded-lg mb-2">
          <ProductsOfCycleProject
            productByCycle={
              projectData.projectFinancialInfo.projectProductByCycle
            }
          />
        </div>
        <div className="bg-[#F4F8F9] rounded-lg mb-2">
          <CashFlowResume
            cashFlowResume={projectData.projectFinancialInfo.cashFlowResume}
          />
        </div>
      </div>
    );
  }
}
