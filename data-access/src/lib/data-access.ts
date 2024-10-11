/* import { UTxO } from '@meshsdk/core'; */
import axios from 'axios';

const bcrypt = require('bcryptjs');

export const encryptPassword = async (password: string) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error('Error al hashear la contraseña:', error);
    throw new Error('Error al hashear la contraseña');
  }
};

const getProduct = /* GraphQL */ `
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
      id
      name
      tokenGenesis
      description
      isActive
      order
      status
      timeOnVerification
      projectReadiness
      categoryID
      transactions {
        items {
          id
        }
      }
      userProducts {
        items {
          user {
            id
            role
            name
            wallets {
              items {
                id
                address
                stake_address
              }
            }
          }
        }
      }
      productFeatures {
        items {
          id
          value
          isToBlockChain
          order
          isOnMainCard
          isResult
          productID
          verifications {
            items {
              userVerifierID
              userVerifiedID
              verificationComments {
                items {
                  comment
                  createdAt
                  id
                  isCommentByVerifier
                }
              }
              userVerified {
                name
              }
              userVerifier {
                name
              }
              id
            }
          }
          documents {
            items {
              id
              url
              isApproved
              docHash
              data
              isUploadedToBlockChain
              productFeatureID
              signed
              signedHash
              status
              timeStamp
              userID
            }
          }
          feature {
            name
            isVerifable
          }
          featureID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;

//Auth AWS
type Image = {
  id: string;
  productID: string;
  title: string;
  imageURL: string;
  imageURLToDisplay: string;
  format: string;
  carouselDescription: string;
};

type Project = {
  id: string;
  description: string;
  categoryID: string;
  name: string;
  status: string;
  updatedAt: Date;
  createdAt: Date;
  images: { items: [Image] };
  amountToBuy: string;
};

type Category = {
  id: string;
  name: string;
  products: { items: [Project] };
};

const instance = axios.create({
  baseURL: `/api/`,
  withCredentials: true,
});
let graphqlEndpoint: string;
let awsAppSyncApiKey: string;
if (process.env['NEXT_PUBLIC_API_KEY_PLATAFORMA']) {
  awsAppSyncApiKey = process.env['NEXT_PUBLIC_API_KEY_PLATAFORMA'];
} else {
  throw new Error(`Parameter graphqlEndpoint not found`);
}
if (process.env['NEXT_PUBLIC_graphqlEndpoint']) {
  graphqlEndpoint = process.env['NEXT_PUBLIC_graphqlEndpoint'];
} else {
  throw new Error(`Parameter graphqlEndpoint not found`);
}

export async function post(route: string, body = {}) {
  return instance
    .post(`${route}`, body)
    .then(({ data }) => {
      return data;
    })
    .catch((error) => {
      throw error;
    });
}

///////////////////////////////////////////////////////
// The following section is to work with Cardano to build, sign and submit transactions
///////////////////////////////////////////////////////

/* export async function createMintingTransaction(
  endpoint: string,
  recipientAddress: string,
  utxos: UTxO[],
  quantity: number,
  assetMetadata: {},
  price: number
) {
  return await post(endpoint, {
    recipientAddress,
    utxos,
    quantity,
    assetMetadata,
    price,
  });
} */

export async function sign(
  endpoint: string,
  signedTx: string,
  originalMetadata: {}
) {
  return await post(endpoint, {
    signedTx,
    originalMetadata,
  });
}

///////////////////////////////////////////////////////
// The following section is to fetch data from dynamoDB
///////////////////////////////////////////////////////

export async function getCategories() {
  // Get categories only with projects created
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `query getCategories {
        listCategories {
          items {
            id
            products {
              items {
                id
              }
            }
            name
          }
        }
      }`,
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );
  const categories: [Category] = response.data.data.listCategories.items;

  const filteredObj = categories.filter((obj) => {
    return obj.products.items.length > 0;
  });

  return filteredObj;
}

export async function getAllProjects(app: string | undefined) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `query getProjects {
          listProducts(filter: {isActive: {eq: true}}) {
            nextToken
            items {
              id
              showOn
              marketplace {
                id
                name
              }
              marketplaceID
              description
              categoryID 
              category {
                name
              }
              name
              status
              tokenGenesis
              tokenClaimedByOwner
              updatedAt
              createdAt
              userProducts {
                items {
                  user {
                    id
                    role
                    name
                    wallets {
                      items {
                        id
                        address
                        stake_address
                      }
                    }
                  }
                }
              }
              tokens {
                items {
                  id
                  oraclePrice
                  policyID
                  createdAt
                  productID
                  supply
                  tokenName
                  updatedAt
                }
              }
              images {
                items {
                  id
                  productID
                  title
                  imageURL
                  imageURLToDisplay
                  format
                  carouselDescription
                }
              }
              transactions {
                items {
                  id
                }
              }
              scripts (filter: {Active: {eq: true}}){
                items {
                  id
                  script_type
                  token_name
                  pbk
                  testnetAddr
                  Active
                }
              }
              productFeatures {
                nextToken
                items {
                  value
                  documents {
                    items {
                      isApproved
                      signed
                    }
                  }
                  featureID
                  feature {
                    name
                    isVerifable
                    isTemplate
                    description
                    unitOfMeasureID
                    unitOfMeasure {
                      description
                    }
                  }
                  productFeatureResults {
                    items {
                      resultID
                      isActive
                      result {
                        id
                        value
                        varID
                      }
                    }
                  }
                }
              }  
            }
          }
        }`,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );
    console.log(awsAppSyncApiKey, 'awsAppSyncApiKey');
    console.log(graphqlEndpoint, 'graphqlEndpoint');

    console.log('allProducts', response.data.data.listProducts.items);
    const marketplaceProducts = response.data.data.listProducts.items.filter(
      (product: any) => product.marketplace.name === app
    );
    console.log('marketplaceProducts', marketplaceProducts);

    let validProducts = marketplaceProducts.filter((product: any) => {
      let countFeatures = product.productFeatures.items.reduce(
        (count: number, pf: any) => {
          // Condicion 1: Tener periodos de precios y cantidad de tokens
          if (pf.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA') {
            let data = JSON.parse(pf.value);
            let todaysDate = Date.now();
            if (data.some((date: any) => Date.parse(date.date) > todaysDate))
              return count + 1;
          }
          // Condicion 2: Tener titulares diligenciados
          /* if (pf.featureID === 'B_owners') {
              let data = JSON.parse(pf.value || '[]');
              if (Object.keys(data).length !== 0) return count + 1;
            } */
          // Condicion 3: Validador ha oficializado la información financiera
          if (
            pf.featureID === 'GLOBAL_VALIDATOR_SET_FINANCIAL_CONDITIONS' &&
            pf.value === 'true'
          ) {
            return count + 1;
          }
          // Condicion 4: Validador ha oficializado la información tecnica
          if (
            pf.featureID === 'GLOBAL_VALIDATOR_SET_TECHNICAL_CONDITIONS' &&
            pf.value === 'true'
          ) {
            return count + 1;
          }
          // Condicion 5: Postulante ha aceptado las condiciones
          if (
            pf.featureID === 'GLOBAL_OWNER_ACCEPTS_CONDITIONS' &&
            pf.value === 'true'
          ) {
            return count + 1;
          }
          // Condicion 6: Postulante ha ingresado
          if (pf.featureID === 'C_ubicacion') {
            return count + 1;
          }
          return count;
        },
        0
      );
      return countFeatures === 5;
    });

    // Condicion 7: Todos los archivos deben estar validados
    validProducts = validProducts.filter((product: any) => {
      const verifiablePF = product.productFeatures.items.filter(
        (pf: any) => pf.feature.isVerifable === true
      );

      const documents = verifiablePF
        .map((pf: any) => {
          const docs = pf.documents.items.filter(
            (document: any) => document.status !== 'validatorFile'
          );
          return docs;
        })
        .flat();

      const approvedDocuments = documents.filter(
        (projectFile: any) => projectFile.isApproved === true
      );
      if (documents.length === approvedDocuments.length) return true;
    });

    return validProducts;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getProjects(app: any) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `query getProjects {
          listProducts(filter: {isActive: {eq: true}}) {
            nextToken
            items {
              id
              description
              showOn
              categoryID 
              category {
                name
              }
              marketplace {
                name
              }
              name
              status
              tokenGenesis
              updatedAt
              createdAt
              tokens {
                items {
                  id
                  oraclePrice
                  policyID
                  createdAt
                  productID
                  supply
                  tokenName
                  updatedAt
                }
              }
              images {
                items {
                  id
                  productID
                  title
                  imageURL
                  imageURLToDisplay
                  format
                  carouselDescription
                }
              }
              transactions {
                items {
                  id
                }
              }
              scripts (filter: {Active: {eq: true}}){
                items {
                  id
                  script_type
                  token_name
                  testnetAddr
                  Active
                }
              }
              productFeatures {
                nextToken
                items {
                  value
                  documents {
                    items {
                      isApproved
                      signed
                    }
                  }
                  featureID
                  feature {
                    name
                    isVerifable
                    isTemplate
                    description
                    unitOfMeasureID
                    unitOfMeasure {
                      description
                    }
                  }
                  productFeatureResults {
                    items {
                      resultID
                      isActive
                      result {
                        id
                        value
                        varID
                      }
                    }
                  }
                }
              }  
            }
          }
        }`,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );
    console.log(awsAppSyncApiKey, 'awsAppSyncApiKey');
    console.log(graphqlEndpoint, 'graphqlEndpoint');
    let validProducts = response.data.data.listProducts.items.filter(
      (product: any) => {
        let countFeatures = product.productFeatures.items.reduce(
          (count: number, pf: any) => {
            // Condicion 1: Tener periodos de precios y cantidad de tokens
            if (pf.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA') {
              let data = JSON.parse(pf.value);
              let todaysDate = Date.now();
              if (data.some((date: any) => Date.parse(date.date) > todaysDate))
                return count + 1;
            }
            // Condicion 2: Tener titulares diligenciados
            /* if (pf.featureID === 'B_owners') {
              let data = JSON.parse(pf.value || '[]');
              if (Object.keys(data).length !== 0) return count + 1;
            } */
            // Condicion 3: Validador ha oficializado la información financiera
            if (
              pf.featureID === 'GLOBAL_VALIDATOR_SET_FINANCIAL_CONDITIONS' &&
              pf.value === 'true'
            ) {
              return count + 1;
            }
            // Condicion 4: Validador ha oficializado la información tecnica
            if (
              pf.featureID === 'GLOBAL_VALIDATOR_SET_TECHNICAL_CONDITIONS' &&
              pf.value === 'true'
            ) {
              return count + 1;
            }
            // Condicion 5: Postulante ha aceptado las condiciones
            if (
              pf.featureID === 'GLOBAL_OWNER_ACCEPTS_CONDITIONS' &&
              pf.value === 'true'
            ) {
              return count + 1;
            }
            // Condicion 6: Postulante ha ingresado
            if (pf.featureID === 'C_ubicacion') {
              return count + 1;
            }
            return count;
          },
          0
        );
        return countFeatures === 5 && product.marketplace.name === app;
      }
    );

    // Condicion 7: Todos los archivos deben estar validados
    validProducts = validProducts.filter((product: any) => {
      const verifiablePF = product.productFeatures.items.filter(
        (pf: any) => pf.feature.isVerifable === true
      );

      const documents = verifiablePF
        .map((pf: any) => {
          const docs = pf.documents.items.filter(
            (document: any) => document.status !== 'validatorFile'
          );
          return docs;
        })
        .flat();

      const approvedDocuments = documents.filter(
        (projectFile: any) => projectFile.isApproved === true
      );
      if (documents.length === approvedDocuments.length) return true;
    });

    // Condicion 8: Genesis del token requerido

    validProducts = validProducts.filter((product: any) => {
      const hasTokenGenesis = product.tokenGenesis;
      if (hasTokenGenesis) {
        return true;
      } else {
        return false;
      }
    });

    return validProducts;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getProjectsFeatures() {
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `query getProjects {
        listProducts(filter: {isActive: {eq: true}}) {
          nextToken
          items {
            id
            description
            categoryID
            amountToBuy
            name
            status
            updatedAt
            createdAt
            images {
              items {
                id
                productID
                title
                imageURL
                imageURLToDisplay
                format
                carouselDescription
              }
            }
            productFeatures(filter: {isToBlockChain: {eq: true}}) {
              items {
                featureID
                value
              }
            }
            transactions {
              items {
                id
              }
            }
            category {
              name
              id
              isSelected
              createdAt
            }
          }
        }
      }`,
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );

  return response.data.data.listProducts.items;
}

export async function getProjectsByCategory(categoryId: string) {
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `query getProjects {
        listProducts(filter: {categoryID: {eq: "${categoryId}"}, isActive: {eq: true}}) {
          nextToken
          items {
            id
            description
            categoryID
            amountToBuy
            name
            status
            updatedAt
            createdAt
            images {
              items {
                id
                productID
                title
                imageURL
                imageURLToDisplay
                format
                carouselDescription
                order
              }
            }
          }
        }
      }`,
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );
  return response.data.data.listProducts.items;
}

export async function getProjectData(projectId: string) {
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: getProduct,
      variables: { id: projectId },
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );
  return response.data.data.getProduct;
}

export async function getProjectTokenDistribution(projectId: string) {
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `query getProjects {
        getProduct(id: "${projectId}") {
          id
          productFeatures {
            items {
              id
              value
              feature {
                name
                isVerifable
              }
              featureID
              createdAt
              updatedAt
            }
            nextToken
          }
        }
      }`,
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );

  const productFeatures = response.data.data.getProduct.productFeatures.items;
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
}

export async function getPendingTokensForClaiming(userId: string) {
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `query getPayment {
        listPayments(filter: {userID: {eq: "${userId}"}, statusCode: {eq: "1"}, claimedByUser: {eq: false}}) {
          items {
            id
            userID
            claimedByUser
            tokenName
            tokenAmount
            statusCode
            productID
            product {
              scripts {
                items {
                  id
                  script_type
                  token_name
                  testnetAddr
                  Active
                }
              }
            }
          }
        }
      }`,
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );

  const data = response.data.data.listPayments.items;

  if (data) {
    const pendingTokensForClaiming = data.filter(
      (payment: any) =>
        payment.statusCode === '1' && payment.claimedByUser === false
    );
    return pendingTokensForClaiming;
  }
  return false;
}

export async function getProject(projectId: string) {
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `query getProjects {
        getProduct(id: "${projectId}") {
          id
          categoryID
          createdAt
          description
          isActive
          name
          order
          status
          updatedAt
          timeOnVerification
          projectReadiness
          categoryID
          tokens {
            items {
              id
              policyID
              tokenName
              supply
              oraclePrice
            }
          }
          scripts {
            items {
              id
              script_type
              token_name
              testnetAddr
              Active
            }
          }
          userProducts {
            items {
              user {
                id
                role
                name
              }
            }
          }
          transactions {
            items {
              id
            }
          }
          images {
            items {
              id
              productID
              title
              imageURL
              imageURLToDisplay
              format
              carouselDescription
              order
            }
          }
          category{
            name
          }
          productFeatures {
        items {
          id
          value
          isToBlockChain
          order
          isOnMainCard
          isResult
          productID
          verifications {
            items {
              userVerifierID
              userVerifiedID
              verificationComments {
                items {
                  comment
                  createdAt
                  id
                  isCommentByVerifier
                }
              }
              userVerified {
                name
              }
              userVerifier {
                name
              }
              id
            }
          }
          documents {
            items {
              id
              url
              isApproved
              docHash
              data
              isUploadedToBlockChain
              productFeatureID
              signed
              signedHash
              status
              timeStamp
              userID
            }
          }
          feature {
            name
            isVerifable
          }
          featureID
          createdAt
          updatedAt
        }
        nextToken
      }
        }
      }`,
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );

  return response.data.data.getProduct;
}

export async function getTransactions() {
  try {
    const response = await axios.post(
      graphqlEndpoint, // Make sure you have 'graphqlEndpoint' defined
      {
        query: `
        query MyQuery {
          listTransactions {
            items {
              productID
              product {
                productFeatures {
                  items {
                    value
                    featureID
                  }
                }
                createdAt
                description
                name
                category {
                  name
                }
              }
              addressDestination
              addressOrigin
              txHash
              createdAt
              id
              stakeAddress
              tokenName
            }
          }
        }
        `,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey, // Make sure you have 'awsAppSyncApiKey' defined
        },
      }
    );

    return response.data.data.listTransactions.items;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function getRates() {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `
        query MyQuery {
          listRates {
            items {
              id
              value
              currency
            }
          }
        }
        `,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    return response.data.data.listRates.items;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function getCoreWallet() {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `query listWallets {
          listWallets(filter: {isAdmin: {eq: ${true}}}) {
            items {
              id
              address
            }
          }
        }`,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );
    if (response.data.data.listWallets.items.length > 0) {
      return response.data.data.listWallets.items[0];
    }
  } catch (error) {
    console.log(error);
  }
  return false;
}

export async function getImages(imageURL: string) {
  try {
    const url = `${process.env['NEXT_PUBLIC_s3EndPoint']}public/${imageURL}`;

    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const data = Buffer.from(response.data, 'binary').toString('base64');
    const dataImage = `data:${response.headers[
      'content-type'
    ].toLowerCase()};base64,${data}`;
    return dataImage;
  } catch (error) {
    console.error(error);
    return;
  }
}
export async function getImagesCategories(category: string) {
  try {
    const url = `${process.env['NEXT_PUBLIC_s3EndPoint']}public/category-projects-images/${category}.jpg`;
    return url;
    // const response = await axios.get(url, { responseType: "arraybuffer" });
    // const data = Buffer.from(response.data, "binary").toString("base64");
    // const dataImage = `data:${response.headers[
    //   "content-type"
    // ].toLowerCase()};base64,${data}`;
    // return dataImage;
  } catch (error) {
    console.error(error);
    return;
  }
}
export async function getUser(userId: string) {
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `query MyQuery {
        getUser(id: "${userId}") {
          name
        }
      }`,
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );

  return response.data.data.getUser;
}

export async function isValidUser(userId: string) {
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `query MyQuery {
        getUser(id: "${userId}") {
          name
          isValidatedStep1
          isValidatedStep2
        }
      }`,
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );

  const user = response.data.data.getUser;

  if (user) {
    return {
      isValidatedStep1: user.isValidatedStep1,
      isValidatedStep2: user.isValidatedStep2,
    };
  }

  return false;
}

export async function updateMarketplaceConfig(
  oracleWalletID: string,
  oracleTokenName: string
) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `
        mutation UpdateMarketplace($input: UpdateMarketplaceInput!) {
          updateMarketplace(input: $input) {
            id
          }
        }
      `,
        variables: {
          input: {
            id: process.env['NEXT_PUBLIC_MARKETPLACE_NAME']?.toLowerCase(),
            oracleWalletID: oracleWalletID,
            oracleTokenName: oracleTokenName,
          },
        },
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    return response;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function validateUserStep2(userId: string) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `
        mutation UpdateUser($input: UpdateUserInput!) {
          updateUser(input: $input) {
            id
          }
        }
      `,
        variables: {
          input: {
            id: userId,
            isValidatedStep2: true,
          },
        },
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    return response;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function verifyWallet(stakeAddress: string) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `query getUserByWallet {
          listWallets(filter: {id: {eq: "${stakeAddress}"}}) {
            items {
              id
            }
          }
        }`,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );
    if (response.data.data.listWallets.items.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getWalletByUser(userId: string): Promise<any> {
  let output = '';
  let response = '';

  try {
    response = await axios.post(
      graphqlEndpoint,
      {
        query: `query getWalletByUser {
          getUser(id: "${userId}") {
            wallets {
              items {
                id
                address
                claimed_token
                stake_address
                name
                isAdmin
                claimedToken {
                  items {
                    marketplaceID
                    id
                  }
                }
              }
            }
          }
        }`,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );
    //@ts-ignore
    output = response.data.data.getUser?.wallets?.items || [];
  } catch (error) {
    console.log(error);
    //@ts-ignore
    output = error;
  }

  return output;
}

export async function checkWalletAddressOnDB(data: string, userID: string) {
  const existWallet = await verifyWallet(data);
  if (!existWallet) {
    try {
      await createWallet(data, userID);
    } catch (error) {
      throw error;
    }
  }
}

export async function createWallet(rewardAddresses: string, userId: string) {
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `mutation MyMutation {
        createWallet(input: {id: "${rewardAddresses}", name: "${rewardAddresses}", status: "new", userID: "${userId}", isAdmin: false}) {
          id
        }
      }`,
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );
  return response;
}
export async function deleteWallet(id: string) {
  console.log(id, 'DELETE WALLET DATA ACCESS');
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `mutation deleteWallet {
        deleteWallet(input: {id: "${id}"}) {
          id
        }
      }`,
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );
  return response;
}
export async function createExternalWallet(
  address: string,
  stake_address: string,
  claimed_token: boolean
) {
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `mutation MyMutation {
        createWallet(input: {
          address: "${address}",
          status: "active", 
          stake_address: "${stake_address}",
          claimed_token: ${claimed_token}, 
          isAdmin: false
        }) {
          id
          address
          claimed_token
        }
      }`,
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );
  return response;
}

export async function getWalletByStakeAddress(stake_address: string) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `query getUserByWallet {
          listWallets(filter: {stake_address: {eq: "${stake_address}"}}) {
            items {
              id
              address
              stake_address
              claimed_token
              isAdmin
            }
          }
        }`,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getScriptsList(app: string) {
  try {
    const response = await axios.post(
      graphqlEndpoint, // Make sure you have 'graphqlEndpoint' defined
      {
        query: `
        query MyQuery {
          listScripts {
            items {
              id
              name
              createdAt
              cbor
              base_code
              MainnetAddr
              Active
              pbk
              productID
              product {
                id
                tokenGenesis
                showOn
                marketplaceID
                marketplace {
                  name
                }
              }
              script_category
              scriptParentID
              script_type
              scripts {
                items {
                  id
                }
              }
              testnetAddr
              token_name
              updatedAt
            }
          }
        }
        `,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey, // Make sure you have 'awsAppSyncApiKey' defined
        },
      }
    );

    const data = response.data.data.listScripts.items;
    const marketplaceScripts = data.filter(
      (script: any) =>
        script.product === null || script.product.marketplace.name === app
    );

    const sortedData = marketplaceScripts.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime(); // Ordenar en orden ascendente (más antiguo al más reciente)
    });

    return sortedData;
  } catch (error) {
    console.error('Error fetching scripts:', error);
    return [];
  }
}

export async function createCoreWallet(id: string, name: string) {
  if (name === '') name = id;
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `mutation MyMutation {
          createWallet(input: {id: "${id}", name: "${name}", status: "new", userID: "a5e0ea8d-95f6-4a8b-bd13-e28f9fa49934", isAdmin: ${true}, isSelected: false}) {
            id
          }
        }`,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );
    return { response, create: true };
  } catch (error) {
    throw error;
  }
}

export async function updateWallet({
  id,
  name,
  passphrase,
  claimed_token,
  isAdmin,
}: any) {
  const hash = await encryptPassword(passphrase);
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `
        mutation UpdateWallet($input: UpdateWalletInput!) {
          updateWallet(input: $input) {
            id
            claimed_token
          }
        }
      `,
      variables: {
        input: {
          id: id,
          isAdmin,
          status: 'active',
          isSelected: false,
          password: hash,
          name: name,
          claimed_token,
        },
      },
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );

  return response;
}

export async function createToken({
  tokenName,
  supply,
  productID,
  policyID,
  oraclePrice,
}: any) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `
          mutation CreateToken($input: CreateTokenInput!) {
            createToken(input: $input) {
              id
              supply
              productID
              policyID
              oraclePrice
            }
          }
        `,
        variables: {
          input: {
            tokenName: tokenName,
            supply: supply,
            productID: productID,
            policyID: policyID,
            oraclePrice: oraclePrice,
          },
        },
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating token: ', error);
    return false;
  }
}

export async function updatePayment({ id, ref, statusCode }: any) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `
          mutation UpdatePayment($input: UpdatePaymentInput!) {
            updatePayment(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: id,
            ref: ref,
            statusCode: statusCode,
          },
        },
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating payment:', error);
    return false;
  }
}

export async function updatePaymentClaimedStatus({ id, claimedByUser }: any) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `
          mutation UpdatePayment($input: UpdatePaymentInput!) {
            updatePayment(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: id,
            claimedByUser: claimedByUser,
          },
        },
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating payment:', error);
    return false;
  }
}
export async function createPayment({
  id,
  orderType,
  tokenAmount,
  tokenName,
  currency,
  finalValue,
  productID,
  userID,
  walletAddress,
  walletStakeAddress,
  exchangeRate,
}: any) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `
          mutation CreatePayment($input: CreatePaymentInput!) {
            createPayment(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: id,
            orderType: orderType,
            statusCode: null,
            finalValue: finalValue,
            tokenAmount: tokenAmount,
            tokenName: tokenName,
            currency: currency,
            productID: productID,
            userID: userID,
            walletAddress,
            walletStakeAddress,
            claimedByUser: false,
            exchangeRate: exchangeRate,
          },
        },
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
}

export async function updateProduct({
  id,
  tokenClaimedByOwner,
  tokenGenesis,
}: any) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `
          mutation UpdateProduct($input: UpdateProductInput!) {
            updateProduct(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: id,
            tokenClaimedByOwner: tokenClaimedByOwner,
            tokenGenesis,
          },
        },
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
}

export async function updateScriptById(policyID: string, newStatus: boolean) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `
          mutation MyMutation($input: UpdateScriptInput!) {
            updateScript(input: $input) {
              id
              Active
            }
          }
        `,
        variables: {
          input: {
            id: policyID,
            Active: newStatus,
          },
        },
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating script request:', error);
    return false;
  }
}

export async function deleteScriptById(policyID: string) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `
          mutation MyMutation($input: DeleteScriptInput!) {
            deleteScript(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: policyID,
          },
        },
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error deleting script request:', error);
    return false;
  }
}
export async function claimToken({ id }: any) {
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `
        mutation UpdateWallet($input: UpdateWalletInput!) {
          updateWallet(input: $input) {
            id
            claimed_token
          }
        }
      `,
      variables: {
        input: {
          id: id,
          claimed_token: true,
        },
      },
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );

  return response;
}

export async function getPeriodTokenData(tokens_name: Array<string>) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `query MyQuery {
  listTokens {
    items {
      tokenName
      oraclePrice
      id
    }
  }
}
`,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    let tokenData =
      response.data.data.listTokens.items[0].oraclePrice / 1000000;
    return tokenData;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function createOrder(objeto: any) {
  const {
    tokenPolicyId,
    tokenName,
    tokenAmount,
    walletID,
    scriptID,
    value,
    utxos,
    statusCode,
    productID,
  } = objeto;
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `mutation MyMutation {
          createOrder(input: {
            productID: "${productID}".
            tokenPolicyId: "${tokenPolicyId}",
            tokenName:"${tokenName}",
            tokenAmount: ${tokenAmount},
            walletID: "${walletID}",
            scriptID: "${scriptID}",
            value: ${value},
            utxos: "${utxos}",
            statusCode: "${statusCode}",
          })
          {
            id
          }
        }`,
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );
  return response.data.data.createOrder;
}

export async function updateOrder(objeto: any) {
  const { id, statusCode, walletBuyerID } = objeto;
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `
          mutation UpdateOrder($input: UpdateOrderInput!) {
            updateOrder(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: id,
            statusCode: statusCode,
            walletBuyerID: walletBuyerID,
          },
        },
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    return response.data.data.updateOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    return false;
  }
}

export async function getOracleWalletId(marketplace: string) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `query listMarketplaces {
          listMarketplaces(filter: {id: {eq: "${marketplace}"}}) {
            items {
              id
              name
              oracleTokenName
              oracleWalletID
            }
          }
        }`,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    if (response.data.data.listMarketplaces) {
      return (
        response.data.data.listMarketplaces.items[0].oracleWalletID || false
      );
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function createTransaction({
  addressDestination,
  addressOrigin,
  walletID,
  txIn,
  txOutput,
  txCborhex,
  txHash,
  mint,
  scriptDataHash,
  metadataUrl,
  redeemer = '',
  fees,
  network,
  type,
  productID,
  signed,
}: any) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `mutation MyMutation($input: CreateTransactionsInput!) {
          createTransactions(input: $input) {
            id
          }
        }`,
        variables: {
          input: {
            addressOrigin,
            addressDestination,
            walletID,
            txIn,
            txOutput,
            txCborhex,
            txHash,
            mint,
            scriptDataHash,
            metadataUrl,
            redeemer,
            fees,
            network,
            type,
            productID,
            signed,
          },
        },
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );
    console.log(response.data);
    return response.data.data.createTransactions;
  } catch (error: any) {
    return error;
  }
}

export async function updateTransaction({ id, signed }: any) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `mutation MyMutation($input: UpdateTransactionsInput!) {
          updateTransactions(input: $input) {
            id
          }
        }`,
        variables: {
          input: {
            id,
            signed,
          },
        },
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );
    return response.data.data.updateTransactions;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function createUser(userPayload: any) {
  const { id, username, role, email } = userPayload;
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `mutation MyMutation {
          createUser(input: {
            id: "${id}"
            name: "${username}"
            isProfileUpdated: true
            role: "${role}"
            email: "${email}"
          })
          {
            id
          }
        }`,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );
    return response.data.data.createUser;
  } catch (error) {
    //@ts-ignore
    console.log(JSON.stringify(error), 'ERROR DE LA QUERY');
  }
}

export async function validateExternalWalletUser(userPayload: any) {
  const { username, role, email, walletId } = userPayload;

  // Crear usuario
  const responseCreateUser = await axios.post(
    graphqlEndpoint,
    {
      query: `mutation MyMutation {
        createUser(input: {
          name: "${username}"
          isProfileUpdated: true
          isValidatedStep1: true
          role: "${role}"
          email: "${email}"
        })
        {
          id
        }
      }`,
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );
  const newUser = responseCreateUser.data.data.createUser;

  if (!newUser) {
    return false;
  }

  // Actualizar tabla wallet
  const responseUpdateWallet = await axios.post(
    graphqlEndpoint,
    {
      query: `
        mutation UpdateWallet($input: UpdateWalletInput!) {
          updateWallet(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          id: walletId,
          userID: newUser.id,
        },
      },
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );

  if (!responseUpdateWallet) {
    return false;
  }

  return true;
}

export async function checkIfWalletIsAdmin(walletStakeID: any) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `query getWallet {
          getWallet(id: "${walletStakeID}") {
            id
            name
            status
            isSelected
            isAdmin
          }
        }`,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    if (response.data.data.getWallet) {
      return response.data.data.getWallet.isAdmin === true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error checking wallet admin status:', error);
    return false;
  }
}

export async function verifyOwners(payload: any) {
  const endpoint = 'https://35mjjiz0fh.execute-api.us-east-1.amazonaws.com/Env';

  try {
    const response = await axios.post(endpoint, payload);

    if (response.data) {
      return JSON.parse(response.data.body);
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error checking wallet admin status:', error);
    return false;
  }
}

export async function validatePassword(
  password: string,
  walletStakeID: string
) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `query getWallet {
          getWallet(id: "${walletStakeID}") {
            password
          }
        }`,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );
    if (response.data.data.getWallet) {
      const hash = response.data.data.getWallet.password;
      return bcrypt.compareSync(password, hash);
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error checking wallet password:', error);
    return false;
  }
}

export async function listTokens() {
  // Get categories only with projects created
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `query getTokens {
        listTokens {
          items {
            policyID
            tokenName
            oraclePrice
            productID
            product {
              marketplace {
                name
                id
              }
            }
          }
        }
      }`,
    },
    {
      headers: {
        'x-api-key': awsAppSyncApiKey,
      },
    }
  );

  const appTokens = response.data.data.listTokens.items.filter(
    (token: any) =>
      token.product.marketplace.name ===
      process.env['NEXT_PUBLIC_MARKETPLACE_NAME']
  );

  return appTokens;
}

export async function getOrdersList(
  filterByWalletId: string | null = null,
  limit: number = 10,
  filterByStatusCode: string | null = null,
  nextToken: string | null = null
) {
  try {
    const filterConditions = [];

    if (filterByWalletId !== null && filterByWalletId !== '') {
      filterConditions.push(`walletID: {eq: "${filterByWalletId}"}`);
    }

    if (filterByStatusCode !== null && filterByStatusCode !== '') {
      filterConditions.push(`statusCode: {eq: "${filterByStatusCode}"}`);
    }

    const filter =
      filterConditions.length > 0
        ? `, filter: {${filterConditions.join(', ')}}`
        : '';

    const pagination = nextToken ? `, nextToken: "${nextToken}"` : '';
    /* limit: ${limit}${pagination} */
    const query = `query getOrders {
      listOrders (${filter}) {
        items {
          id
          tokenPolicyId
          tokenAmount
          tokenName
          statusCode
          utxos
          walletID
          walletBuyerID
          wallet {
            address
          }
          productID
          product {
            marketplace {
              id
              name
            }
          }
          scriptID
          value
        }
        nextToken
      }
    }`;

    const response = await axios.post(
      graphqlEndpoint,
      { query },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    const data = response.data.data.listOrders.items.filter(
      (order: any) =>
        order.product.marketplace.name ===
        process.env['NEXT_PUBLIC_MARKETPLACE_NAME']
    );

    return data;
  } catch (error) {
    console.error('Error getting Orders List:', error);
    return false;
  }
}

export async function coingeckoPrices(crypto: string, base_currency: string) {
  try {
    const response = await fetch(
      `/api/mint/oracle?crypto=${crypto}&base_currency=${base_currency}`
    );
    const data = await response.json();
    return data.finalRate;
  } catch (error) {
    console.error('Error', error);
  }
}

export async function listTokensDashboard(productID: string) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `query listTokens {
          listTokens(filter: {productID: {eq: "${productID}"}}) {
            items {
              policyID
            }
          }
        }`,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getScriptTokenAccess(marketplace: string) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `query listScripts {
          listScripts(filter: {marketplaceID: {eq: "${marketplace}"}}) {
            items {
              id
              marketplaceID
              name
              pbk
              token_name
            }
          }
        }`,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function createClaimedToken(
  marketplaceID: string,
  walletID: string
) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `
        mutation CreateClaimedToken(
          $input: CreateClaimedTokenInput!
          $condition: ModelClaimedTokenConditionInput
        ) {
          createClaimedToken(input: $input, condition: $condition) {
            id
          }
        }
      `,
        variables: {
          input: {
            marketplaceID: marketplaceID,
            walletID: walletID,
          },
        },
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating token: ', error);
    return false;
  }
}

export async function checkClaimedToken(
  marketplaceID: string,
  walletID: string
) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `
          query listClaimedTokens {
            listClaimedTokens(filter: {and: {marketplaceID: {eq: "${marketplaceID}"}, walletID: {eq: "${walletID}"}}}) {
              items {
                id
              }
            }
          }
        `,
      },
      {
        headers: {
          'x-api-key': awsAppSyncApiKey,
        },
      }
    );
    if (response.data.data.listClaimedTokens.items.length > 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}
