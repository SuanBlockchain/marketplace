//import { UTxO } from "@meshsdk/core";
import axios from 'axios';
import { Category } from 'myTypes';
import {
  signUp,
  confirmSignUp,
  type ConfirmSignUpInput,
  signIn,
  type SignInInput,
  signOut,
  resetPassword,
  type ResetPasswordInput,
  confirmResetPassword,
  type ConfirmResetPasswordInput,
  resendSignUpCode,
  confirmSignIn,
  type ConfirmSignInInput,
} from 'aws-amplify/auth';
/* import { integer } from "aws-sdk/clients/cloudfront"; */
import { getProduct } from '@suan//lib/customQueries';
/* const AWS = require("aws-sdk");

AWS.config.update(awsconfig); */

//Auth AWS

type SignUpParameters = {
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  role: string;
};

export async function signUpAuth({
  username,
  password,
  email,
  role,
}: SignUpParameters) {
  try {
    const response = await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email,
          'custom:role': role,
        },
      },
    });
    const userPayload = {
      id: response.userId,
      username,
      role,
      email,
    };
    const responseApi = await fetch('/api/calls/backend/createUser', {
      method: 'POST',
      body: JSON.stringify(userPayload),
    });
    const data = await responseApi.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function confirmSignUpAuth({
  username,
  confirmationCode,
}: ConfirmSignUpInput) {
  try {
    let result = await confirmSignUp({ username, confirmationCode });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function signInAuth({ username, password }: SignInInput) {
  try {
    const user = await signIn({ username, password });
    return user;
  } catch (error) {
    throw error;
  }
}

export async function confirmSignInAuth({
  challengeResponse,
}: ConfirmSignInInput) {
  try {
    const response = await confirmSignIn({ challengeResponse });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function signOutAuth() {
  try {
    await signOut();
  } catch (error) {
    console.log('error signing out: ', error);
  }
}

export async function forgotPassword({ username }: ResetPasswordInput) {
  try {
    const data = await resetPassword({ username });
    console.log(data, 'forgotPassword');
    return data;
  } catch (err) {
    throw err;
  }
}

export async function forgotPasswordSubmit({
  username,
  confirmationCode,
  newPassword,
}: ConfirmResetPasswordInput) {
  try {
    await confirmResetPassword({ username, confirmationCode, newPassword });
    return { code: 'Success', message: 'Password changed successfully' };
  } catch (err) {
    throw err;
  }
}

export const handleResendCode = async (username: string) => {
  const { destination, deliveryMedium, attributeName } = await resendSignUpCode(
    { username }
  );
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

export async function getProjects() {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      {
        query: `query getProjects {
          listProducts(filter: {isActive: {eq: true}, showOn: {eq: "Suan"}}) {
            nextToken
            items {
              id
              description
              categoryID 
              category {
                name
              }
              name
              status
              showOn
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
                  amountOfTokens
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
            if (pf.featureID === 'B_owners') {
              let data = JSON.parse(pf.value || '[]');
              if (Object.keys(data).length !== 0) return count + 1;
            }
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
            // if (
            //   pf.featureID === "GLOBAL_OWNER_ACCEPTS_CONDITIONS" &&
            //   pf.value === "true"
            // ) {
            //   return count + 1;
            // }
            // Condicion 6: Postulante ha aceptado las condiciones
            if (pf.featureID === 'C_ubicacion') {
              return count + 1;
            }
            return count;
          },
          0
        );
        return countFeatures === 5;
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
                amountOfTokens
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
          transactions {
            items {
              id
              amountOfTokens
            }
          }
          productFeatures {
            items {
              featureID
              value

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
                id
                category {
                  name
                }
              }
              addressDestination
              addressOrigin
              amountOfTokens
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

    console.log('Hola', response.data.data);

    return response.data.data.listTransactions.items;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
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
    const url = `${process.env['NEXT_PUBLIC_s3EndPoint']}public/category-projects-images/${category}.avif`;
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
  }
}

export async function getWalletByUser(userId: string): Promise<[id: string]> {
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `query getWalletByUser {
        getUser(id: "${userId}") {
          wallets {
            items {
              id
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

  const output = response.data.data.getUser?.wallets?.items || [];
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

export async function createOrder(objeto: any) {
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `mutation MyMutation {
        createOrder(input: {currencyCode: ${objeto.currencyCode}, externalOrderId: "${objeto.externalOrderId}", fiatTotalAmount: "${objeto.fiatTotalAmount}", statusCode: "${objeto.statusCode}", userProductID: "${objeto.userProductID}"}) {
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

export async function createTransaction({
  productID,
  stakeAddress,
  policyID,
  addressDestination,
  addressOrigin,
  amountOfTokens,
  fees,
  network,
  tokenName,
  txCborhex,
  txHash,
  txIn,
  txProcessed,
  type,
}: any) {
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `mutation MyMutation {
        createTransactions(input: {
          productID: "${productID}",
          stakeAddress:"${stakeAddress}",
          policyID:"${policyID}",
          addressDestination: "${addressDestination}",
          addressOrigin: "${addressOrigin}",
          amountOfTokens: ${amountOfTokens},
          fees: ${fees},
          network: "${network}",
          tokenName: "${tokenName}",
          txCborhex: "${txCborhex}",
          txHash: "${txHash}",
          txIn: "${txIn}",
          txProcessed: ${txProcessed},
          type: "${type}",
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
  return response.data.data.createTransactions;
}

export async function updateTransaction({ id, txProcessed, fees }: any) {
  const response = await axios.post(
    graphqlEndpoint,
    {
      query: `mutation MyMutation {
        updateTransactions(input: {
          id: "${id}",
          txProcessed: ${txProcessed},
          fees: ${fees}
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
  return response;
}
export async function createUser(userPayload: any) {
  const { id, username, role, email } = userPayload;
  console.log(username, role, email);
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
  return response.data.data.createUsers;
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

export async function getPolygonByCadastralNumber(cadastralNumbers: any) {
  // URL de la consulta
  const url = `${process.env['NEXT_PUBLIC_CADASTRAL_QUERY_URL']}/14/query`;

  const whereClause = `CODIGO IN ('${cadastralNumbers.join("','")}')`;

  // Parámetros de la consulta
  const queryParams: any = {
    where: whereClause,
    objectIds: '',
    time: '',
    geometry: '',
    geometryType: 'esriGeometryPoint',
    inSR: '',
    spatialRel: 'esriSpatialRelIntersects',
    resultType: 'none',
    distance: 0.0,
    units: 'esriSRUnit_Meter',
    relationParam: '',
    returnGeodetic: false,
    outFields: '*',
    returnGeometry: true,
    returnCentroid: false,
    returnEnvelope: false,
    featureEncoding: 'esriDefault',
    multipatchOption: 'xyFootprint',
    maxAllowableOffset: '',
    geometryPrecision: '',
    outSR: '',
    defaultSR: '',
    datumTransformation: '',
    applyVCSProjection: false,
    returnIdsOnly: false,
    returnUniqueIdsOnly: false,
    returnCountOnly: false,
    returnExtentOnly: false,
    returnQueryGeometry: false,
    returnDistinctValues: false,
    cacheHint: false,
    orderByFields: '',
    groupByFieldsForStatistics: '',
    outStatistics: '',
    having: '',
    resultOffset: '',
    resultRecordCount: '',
    returnZ: false,
    returnM: false,
    returnExceededLimitFeatures: true,
    quantizationParameters: '',
    sqlFormat: 'none',
    f: 'pgeojson',
    token: '',
  };

  // Construir la URL completa con los parámetros
  const fullUrl = `${url}?${new URLSearchParams(queryParams)}`;

  try {
    const response = await fetch(fullUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
  }
}
