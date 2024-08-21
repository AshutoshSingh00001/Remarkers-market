import React from "react";
import { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    CardFooter,
    Typography,
    CardHeader,
    Button,
    Input,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    IconButton,
    Chip,
    Switch,
    Tooltip,
    List,
    ListItem,
    ListItemPrefix,
    ListItemSuffix,
    Badge,
} from '@material-tailwind/react'
import Axios, { all } from 'axios';
import { useStorageUpload } from "@thirdweb-dev/react";
import axios from "axios";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts, web3FromAddress, web3EnablePromise } from '@polkadot/extension-dapp';
import { ToastContainer, toast } from 'react-toastify';
import {isUndefined, stringToHex} from '@polkadot/util'
import {CheckIcon} from "@heroicons/react/24/outline";
import { number, promise } from "zod";
import { MediaRenderer } from "@thirdweb-dev/react";

export default function PAHCreate( ) {
    const [api, setApi] = useState()
    const [file, setFile] = useState(null);
    const [collectionLogo, setCollectionLogo] = useState()
    const [size, setSize] = React.useState(null);
    const [selectSize, setSelectSize] = React.useState(null)
    const [supplyEnabled, setSupplyEnabled] = useState(true);
    const [createdCollection, setCreatedCollection] = useState()
    const [files, setFiles] = useState()
    const [submitted, setSubmitted] = useState(false);
    const [createNftsubmitted, setCreateNftSubmitted] = useState(false);
    const [collectionMetadata, setCollectionMetadata] = useState(null)
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [createdLoading, setCreatedLoading] = useState()
    const [duplicateEnabled, setDuplicateEnabled] = useState(false)
    const [formData, setFormData] = useState({
      collectionFile: null,
      collectionName: '',
      collectionDescription: '',
      collectionSupply: null,
      collectionTwitter: '',
      collectionDiscord: '',
      collectionExternalLink: ''
    });
    const [traitType, setTraitType] = useState('');
    const [value, setValue] = useState('');
    const [addAttribute, setaddAttribute] = useState([])
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState('');  
    const [nftformData, setNftFormData] = useState({
      itemFile: null,
      itemName: '',
      itemDescription: '',
      attributes: [],
      duplicate: '',
      nextItemId: null
    });

    useEffect(() => {
      setNftFormData((prevData) => ({
        ...prevData,
        attributes: addAttribute,
      }));
    }, [addAttribute]);

    const [isMobile, setIsMobile] = useState();

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.matchMedia('(max-width: 600px)').matches);
      };
  
      // Initial check on mount
      handleResize();
  
      // Listen for window resize events
      window.addEventListener('resize', handleResize);
  
      // Cleanup the event listener on component unmount
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    const { mutateAsync: upload, isLoading } = useStorageUpload();
 
    async function uploadData() {
      const filesToUpload = [];
      const uris = await upload({ data: files });
      console.log(uris);
    }

    const Account = (JSON.parse(localStorage.getItem("Account")))

    const created = async() => {
        try {
          setCreatedLoading(true)
            const response = await Axios.get(`${import.meta.env.VITE_VPS_BACKEND_API}created?address=${JSON.stringify(Account?.address)}`);
            setCreatedCollection(response.data.data); // Store the data directly as an array of objects
            setCreatedLoading(false)
      } catch (error) {
          console.error('Error fetching data:', error);
      }
      }

      useEffect(() => {
        created()
      },[])

  const handleOpen = () => setSize(!size);
  const handleOpenSelectCollection = () => setSelectSize(!selectSize)

  const [selected, setSelected] = React.useState();
  const setSelectedItem = (value) => setSelected(value);

    const handleFileChange = async(event) => {
      const file = event.target.files[0];
      if (file) {
        setFile(URL.createObjectURL(file));
        setSelectedFile(URL.createObjectURL(file));
      setFileType(file.type);
          try {
            const toastId = toast.info('Uploading Content to IPFS', {
              position: "top-right",
              autoClose: false, // Set autoClose to false to keep the toast visible
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
              isLoading: true, // This shows the loading indicator
            });
        
            const fileData = new FormData();
            fileData.append("file", file);
      
            const responseData = await axios({
              method: "post",
              url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
              data: fileData,
              headers: {
                pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
                pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
                "Content-Type": "multipart/form-data",
              },
            });
      
            const fileUrl = "https://gateway.pinata.cloud/ipfs/" + responseData.data.IpfsHash;
            console.log(fileUrl);
            toast.update(toastId, {
              render: 'successfully uploaded',
              type: 'success',
              isLoading: false,
              autoClose: 5000, // Close the toast after 5 seconds
              closeOnClick: true,
            });
            setNftFormData((prevFormData) => ({
              ...prevFormData,
              itemFile: responseData.data.IpfsHash
            }));
          } catch (e) {
            if (e.response) {
              // Server responded with a status other than 2xx
              console.log('Error response:', e.response.data);
              console.log('Error status:', e.response.status);
              console.log('Error headers:', e.response.headers);
            } else if (e.request) {
              // Request was made but no response was received
              console.log('Error request:', e.request);
            } else {
              // Something else happened while setting up the request
              console.log('Error message:', e.message);
            }
          }
      }
    };

    const handleCreateNftSubmit = (event) => {
      event.preventDefault();
      setCreateNftSubmitted(true);
      handleFileChange();
      // Your form submission logic here
      console.log('Form data submitted:', nftformData);
    };

    const handleChangeClick = () => {
        setFile(null);
        document.getElementById('dropzone-file').value = ''; // Reset the input field
      };

      const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
      };

      const handleInputCreateNftChange = (event) => {
        const { name, value } = event.target;
        setNftFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
      };
    
      const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitted(true);
        // Your form submission logic here
        console.log('Form data submitted:', formData);
      };
      
      const handleCollectionFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          setCollectionLogo(URL.createObjectURL(file));
          try {
            const toastId = toast.info('Uploading Content to IPFS', {
              position: "top-right",
              autoClose: false, // Set autoClose to false to keep the toast visible
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
              isLoading: true, // This shows the loading indicator
            });
            const fileData = new FormData();
            fileData.append("file", file);
      
            const responseData = await axios({
              method: "post",
              url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
              data: fileData,
              headers: {
                pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
                pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
                "Content-Type": "multipart/form-data",
              },
            });
      
            const fileUrl = "https://gateway.pinata.cloud/ipfs/" + responseData.data.IpfsHash;
            console.log(fileUrl);
            toast.update(toastId, {
              render: 'successfully uploaded',
              type: 'success',
              isLoading: false,
              autoClose: 5000, // Close the toast after 5 seconds
              closeOnClick: true,
            });
            setFormData((prevFormData) => ({
              ...prevFormData,
              collectionFile: responseData.data.IpfsHash
            }));
          } catch (e) {
            if (e.response) {
              // Server responded with a status other than 2xx
              console.log('Error response:', e.response.data);
              console.log('Error status:', e.response.status);
              console.log('Error headers:', e.response.headers);
            } else if (e.request) {
              // Request was made but no response was received
              console.log('Error request:', e.request);
            } else {
              // Something else happened while setting up the request
              console.log('Error message:', e.message);
            }
          }
        }
      };
      
  
      const handleCollecionChangeClick = () => {
          setCollectionLogo(null);
          document.getElementById('dropzone-file').value = ''; // Reset the input field
        };
        
        
        
        const createCollection = async () => {
          const connectedAccount = JSON.parse(localStorage.getItem('Account'));
          if(connectedAccount){

          if (!formData.collectionFile) {
            toast.warning("Collection image is required", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
            });
            return;
          }
          if (!formData.collectionName) {
            toast.warning("Collection name is required", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
            });
            return;
          }
          if (!formData.collectionDescription) {
            toast.warning("Collection description is required", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
            });
            return;
          }
          // Function to upload metadata
          async function uploadMetadata() {
            const jsonMetadata = {
              name: formData.collectionName,
              description: formData.collectionDescription,
              image: "ipfs://" + formData.collectionFile,
              twitter: formData.collectionTwitter,
              discord: formData.collectionDiscord,
              externalLink: formData.collectionExternalLink,
          };
          if (!jsonMetadata.image) {
            toast.warning("Collection image is required", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
            });
            return;
          }
          toast.info(`Creating collection`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });
          // Use 2 spaces for indentation
          const jsonMetadataString = JSON.stringify(jsonMetadata, null, 2);

          toast.info(`Uploading Metadata`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });
          
          const jsonBlob = new Blob([jsonMetadataString], { type: 'application/json' });
          
      
              const fileData = new FormData();
              fileData.append("file", jsonBlob);
      
              try {
                  const responseData = await axios({
                      method: "post",
                      url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                      data: fileData,
                      headers: {
                          'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
                          'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_KEY,
                          'Content-Type': 'multipart/form-data',
                      },
                  });
      
                  const fileUrl = `https://gateway.pinata.cloud/ipfs/${responseData.data.IpfsHash}`;
                  console.log(fileUrl);
                  return "ipfs://" + responseData.data.IpfsHash;
              } catch (e) {
                  console.error('Error uploading metadata:', e.response ? e.response.data : e);
                  return null;
              }
          }
          toast.info(`Metadata uploaded`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });
          const collectionMetadata = await uploadMetadata();
          if (!collectionMetadata) {
              console.error('Failed to upload metadata. Exiting collection creation.');
              return;
          }
      
          const collectionMetadataHex = stringToHex(collectionMetadata);
          toast.info(`Creating Transaction`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });
          const endpoint = "wss://polkadot-asset-hub-rpc.polkadot.io";
          const wsProvider = new WsProvider(endpoint);
          const api = await ApiPromise.create({ provider: wsProvider });
      
          console.log('API initialized successfully:', api);
      
          try {
              setApi(api);
          const wallet = localStorage.getItem("walletName");
        let signer;
    
        if (wallet === "nova") {
                  // Enable the extension
                  await web3Enable('remarker');
                  const allAccounts = await web3Accounts();
                  const injector = await web3FromAddress(connectedAccount.address);
            
                  // Get all accounts from the extension
              
            
                  // Find the injector for the connected account
              
            
                  signer = injector.signer;
        } else {
          // Check if the wallet extension exists in window.injectedWeb3
          const Connectivity = window.injectedWeb3 && window.injectedWeb3[wallet];
          if (!Connectivity) {
            throw new Error(`${wallet} wallet extension not found.`);
          }
    
          // Enable the extension and get accounts
          const extension = await Connectivity.enable();
          const getAccounts = await extension.accounts.get();
    
          signer = extension.signer;
        }
      
              const admin = connectedAccount.address;
              const config = {
                  settings: "0",
                  maxSupply: supplyEnabled ? null : formData.collectionSupply,
                  mintSettings: {
                      mintType: "Issuer",
                      price: null,
                      startBlock: null,
                      endBlock: null,
                      defaultItemSettings: "0",
                  },
              };
      
              const nextItemIds = (await api.query.nfts.nextCollectionId()).toString(); // Assuming the ID can be immediately used
              const calls = [
                  api.tx.nfts.create(admin, config),
                  api.tx.nfts.setCollectionMetadata(nextItemIds, collectionMetadataHex),
              ];
      
              const batch = api.tx.utility.batchAll(calls);
      
              await batch.signAndSend(connectedAccount.address, { signer: signer }, ({ status }) => {
                  if (status.isInBlock) {
                      toast.success(`Completed at block hash #${status.asInBlock.toString()}`, {
                          position: "top-right",
                          autoClose: 5000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          theme: "colored",
                      });
                      const toastId = toast.info('Transaction is processing', {
                        position: "top-right",
                        autoClose: false, // Set autoClose to false to keep the toast visible
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                        isLoading: true, // This shows the loading indicator
                      });
                    
                      // Simulate an async action, e.g., sending an NFT
                      setTimeout(() => {
                        toast.update(toastId, {
                          render: 'successfully created',
                          type: 'success',
                          isLoading: false,
                          autoClose: 5000, // Close the toast after 5 seconds
                          closeOnClick: true,
                        });
                      }, 30000); // Example delay for the async action (e.g., 25 seconds)=
                  } else {
                      toast.info(`Current status: ${status.type}`, {
                          position: "top-right",
                          autoClose: 5000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          theme: "colored",
                      });
                  }
              }).catch((error) => {
                  toast.error(`Transaction failed: ${error}`, {
                      position: "top-right",
                      autoClose: 5000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "colored",
                  });
              });
          } catch (error) {
              console.error('Operation failed:', error);
          }
        }else{
          toast.info(`Connect your wallet`, {
            position: "top-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          })
        }
      };

      const createNft = async() => {
        const connectedAccount = JSON.parse(localStorage.getItem('Account'));
        if(connectedAccount){
        if (!selectedCollection) {
          toast.warning("Collection is required", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          return;
        }
        if (!nftformData.itemFile) {
          toast.warning("Item Image is required", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          return;
        }
        if (nftformData.itemName.length === 0) {
          toast.warning("Item Name is required", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          return;
        }
        if (nftformData.itemDescription.length === 0) {
          toast.warning("Item Description is required", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          return;
        }
        if (!nftformData.nextItemId) {
          toast.warning("Metadata not constructed", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          return;
        }
        // Function to upload metadata
        async function uploadMetadata() {
          const jsonMetadata = {
            name: nftformData.itemName,
            description: nftformData.itemDescription,
            image: "ipfs://" + nftformData.itemFile,
            attributes: nftformData.attributes,
        };
        if (!jsonMetadata.image) {
          toast.warning("Item image is required", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          return;
        }

        toast.info(`Creating nft`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
      });
        
        // Use 2 spaces for indentation
        const jsonMetadataString = JSON.stringify(jsonMetadata, null, 2);

        toast.info(`Uploading metadata to ipfs`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
      });
        
        const jsonBlob = new Blob([jsonMetadataString], { type: 'application/json' });
        
    
            const fileData = new FormData();
            fileData.append("file", jsonBlob);

            try {
                const responseData = await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    data: fileData,
                    headers: {
                        'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
                        'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_KEY,
                        'Content-Type': 'multipart/form-data',
                    },
                });
    
                const fileUrl = `https://gateway.pinata.cloud/ipfs/${responseData.data.IpfsHash}`;
                console.log(fileUrl);
                return "ipfs://" + responseData.data.IpfsHash;
            } catch (e) {
                console.error('Error uploading metadata:', e.response ? e.response.data : e);
                return null;
            }
      }
    
        const itemMetadata = await uploadMetadata();
        if (!itemMetadata) {
            console.error('Failed to upload metadata. Exiting NFT creation.');
            return;
        }
        toast.info(`Metadata uploaded`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
      });
    
        const itemMetadataHex = stringToHex(itemMetadata);

        toast.info(`Creating Transaction`, {
          position: "top-right",
          autoClose: 8000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
      });
          const endpoint = "wss://polkadot-asset-hub-rpc.polkadot.io";
          const wsProvider = new WsProvider(endpoint);
          const api = await ApiPromise.create({ provider: wsProvider });
      
          console.log('API initialized successfully:', api);

          if(selectedCollection){
          try {
              setApi(api);
          const wallet = localStorage.getItem("walletName");
        let signer;
    
        if (wallet === "nova") {
          // Enable the extension
          await web3Enable('remarker');
          const allAccounts = await web3Accounts();
          const injector = await web3FromAddress(connectedAccount.address);
    
          // Get all accounts from the extension
      
    
          // Find the injector for the connected account
      
    
          signer = injector.signer;
        } else {
          // Check if the wallet extension exists in window.injectedWeb3
          const Connectivity = window.injectedWeb3 && window.injectedWeb3[wallet];
          if (!Connectivity) {
            throw new Error(`${wallet} wallet extension not found.`);
          }
    
          // Enable the extension and get accounts
          const extension = await Connectivity.enable();
          const getAccounts = await extension.accounts.get();
    
          signer = extension.signer;
        }
        console.log("nextItemId", nftformData.nextItemId, selectedCollection.Id)
              const mint_to = connectedAccount.address;

              const duplicateCount = Number(nftformData.duplicate);
            console.log("duplicateCount", duplicateCount, nftformData.nextItemId)

              const calls = [];

              for (let i = 0; i <= duplicateCount; i++) {
                const currentNftData = nftformData.nextItemId + i; // Increment nftData by i for each duplicate
                calls.push(api.tx.nfts.mint(selectedCollection.Id, currentNftData, mint_to, null));
                calls.push(api.tx.nfts.setMetadata(selectedCollection.Id, currentNftData, itemMetadataHex));
              }

              const batch = api.tx.utility.batchAll(calls);
      
              await batch.signAndSend(connectedAccount.address, { signer: signer }, ({ status }) => {
                  if (status.isInBlock) {
                      toast.success(`Completed at block hash #${status.asInBlock.toString()}`, {
                          position: "top-right",
                          autoClose: 5000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          theme: "colored",
                      });
                      const toastId = toast.info('Transaction is processing', {
                        position: "top-right",
                        autoClose: false, // Set autoClose to false to keep the toast visible
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                        isLoading: true, // This shows the loading indicator
                      });
                    
                      // Simulate an async action, e.g., sending an NFT
                      setTimeout(() => {
                        toast.update(toastId, {
                          render: 'successfully created',
                          type: 'success',
                          isLoading: false,
                          autoClose: 5000, // Close the toast after 5 seconds
                          closeOnClick: true,
                        });
                      }, 30000); // Example delay for the async action (e.g., 25 seconds)=
                  } else {
                      toast.info(`Current status: ${status.type}`, {
                          position: "top-right",
                          autoClose: 2500,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          theme: "colored",
                      });
                  }
              }).catch((error) => {
                  toast.error(`Transaction failed: ${error}`, {
                      position: "top-right",
                      autoClose: 5000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "colored",
                  });
              });
          } catch (error) {
              console.error('Operation failed:', error);
          }
        }
        }else{
          toast.info(`Connect your wallet`, {
            position: "top-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          })
        }
        }

        const handleTraitTypeChange = (event) => {
          setTraitType(event.target.value);
        };
      
        const handleValueChange = (event) => {
          setValue(event.target.value);
        };

        const itemAttribute = () => {
          // Add the new attribute to the array in the state
          setaddAttribute((prevAttributes) => [
            ...prevAttributes,
            { trait_type: traitType, value: value }
          ]);
      
          // Clear the input fields
          setTraitType('');
          setValue('');
        };
        console.log(addAttribute)

        const TABLE_HEAD = ["Trait", "Value", ""];

        const deleteAttribute = (index) => {
          setaddAttribute((prevAttributes) => prevAttributes.filter((_, i) => i !== index));
        };

          
    return (
        <>
        <div style={isMobile? {marginLeft: "20px", marginRight: "20px"} : {marginLeft: "400px", marginRight: "400px"}}>
      <Typography variant="h3" style={{marginTop: "50px"}}>Create NFT on Polkadot</Typography>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ width: '500px', maxHeight: '10px' }} 
      />
      <br />
      <Typography variant="h7">
      Mint exquisite NFTs on Polkadot Asset Hub, the Asset Hub parachain facilitates avant-garde NFT trading using DOT as its native token.
      </Typography>
      <br />
<Button onClick={handleOpen} color="pink" variant="outlined">Create Collection</Button>
<br />
<br />
<Button variant="filled" color="pink" onClick={() => {handleOpenSelectCollection(), created()}}>Select Collection </Button>
<br />
<br />
<Typography variant="h6"> <div style={{ display: 'flex', alignItems: 'center' }}> Selected Collection 
</div>
</Typography>
<Dialog handler={handleOpenSelectCollection} open={selectSize} size={"md"}>
<DialogHeader className="justify-between">
        <Typography variant="h5">Select Collection</Typography>
            
            <IconButton
                color="blue-gray"
                size="sm"
                variant="text"
                onClick={handleOpenSelectCollection}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </IconButton></DialogHeader>
  <DialogBody className='h-[30rem] overflow-scroll'>
{createdLoading? ( 
  <>
  <div style={{ display: 'flex', overflowX: 'auto' }}>
            <Card className="w-full">
          
                  <List>
                    <ListItem>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-10 w-10 rounded-lg object-cover object-center text-gray-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
                      <Typography  as="div"
        variant="h1"
        className="mb-4 h-3 w-56 rounded-full bg-gray-300 font-medium" style={{ marginLeft: "20px" }}>
                              &nbsp;
                      </Typography>
                    </ListItem>
                  </List>
            </Card>
          </div>
  </>
): (  <div style={{ display: 'flex', overflowX: 'auto' }}>
            <Card className="w-full">
            {createdCollection && createdCollection.map((item, index) => {
              const itemId = async(item) => {
                try {
                  const toastId = toast.info('Constructing Metadata', {
                    position: "top-right",
                    autoClose: false, // Set autoClose to false to keep the toast visible
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    isLoading: true, // This shows the loading indicator
                  });
          const response = await Axios.get(`${import.meta.env.VITE_VPS_BACKEND_API}itemId?selected=${item && item.Id}`);
          setNftFormData((prevFormData) => ({
            ...prevFormData,
            nextItemId: response.data.data
          }));
          console.log("nextItemIds", response.data.data)

          if(response.data.data){
            toast.update(toastId, {
              render: 'successfully constructed',
              type: 'success',
              isLoading: false,
              autoClose: 5000, // Close the toast after 5 seconds
              closeOnClick: true,
            });
          }
          } catch(error) {
            console.error('Error fetching data:', error);
            }
              }
              return (
                <div key={index} style={{ marginRight: '10px' }} onClick={() => {
                  // handle item click
                }}>
                  <List>
                    <ListItem selected={selected} onClick={() => {
                      setSelectedItem();
                      setSelectedCollection(item);
                      itemId(item)
                      // setOfferedItem(item.itemId);
                      // setOfferedCollection(item.collectionId);
                    }}>
                              <MediaRenderer src={`ipfs://${item && item.itemData.image && item.itemData.image.replace(/^(ipfs:\/\/ipfs\/|ipfs:\/\/)/, "")}`} style={{ height: '2.5rem', width: '2.5rem', borderRadius: '0.5rem', objectFit: 'cover', objectPosition: 'center' }} />
                      <Typography color="blue-gray" className="font-medium" style={{ marginLeft: "20px" }}>
                      {item && item.itemData.name}
                      </Typography>
                    </ListItem>
                  </List>
                </div>
              )})}
            </Card>
          </div>)}
    <br />
  </DialogBody>
  <DialogFooter>
<Button color="pink" onClick={() => {setSelectedItem(), handleOpenSelectCollection()}}>Confirm</Button>
  </DialogFooter>
</Dialog>
{
  selectedCollection? (
    <>
    <Card className="mt-6 w-96">
  <Badge
    content={<CheckIcon className="h-2 w-2 text-white" strokeWidth={2.5} />}
    color="pink"
    className="absolute right-0 bg-gradient-to-tr from-pink-400 to-pink-600 border-2 border-white shadow-lg shadow-black/20"
    style={{ padding: '0.25rem', minWidth: '1.5rem', minHeight: '1.5rem' }}
  >
      <CardBody>
      <div className="flex items-center space-x-4">
      <MediaRenderer src={`ipfs://${selectedCollection && selectedCollection.itemData.image && selectedCollection.itemData.image.replace(/^(ipfs:\/\/ipfs\/|ipfs:\/\/)/, "")}`} style={{ height: '5rem', width: '5rem', borderRadius: '0.5rem', objectFit: 'cover', objectPosition: 'center' }} />
  <Typography variant="h5" color="blue-gray" className="mb-2">
    {selectedCollection.itemData.name}
  </Typography>
</div>

      </CardBody>
      </Badge>
      <CardFooter className="pt-0">

      </CardFooter>
    </Card>
    </>
  ) : null
}
<br />
<Typography variant="h4" >Create NFT</Typography>
<br />
    <div style={{ display: 'flex', alignItems: 'center' }}>
    <Typography variant="h6" style={{marginRight: "10px"}}> Upload File 
</Typography>
<Tooltip
      content={
        <div className="w-80">
          <Typography color="white" className="font-medium">
            Drag and Drop NFT image file
          </Typography>
          <Typography
            variant="small"
            color="white"
            className="font-normal opacity-80"
          >
            supported file formats are : Images
Videos
Audio files
SVGs (for onchain NFTs)
          </Typography>
        </div>
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        className="h-5 w-5 cursor-pointer text-blue-gray-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
        />
      </svg>
    </Tooltip>
    </div>
<br />
<Dialog  handler={handleOpen} open={size} size={"md"}>
<ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ width: '500px', maxHeight: '10px' }} 
      />
        <DialogHeader className="justify-between">
        <Typography variant="h5">Create a collection</Typography>
            
            <IconButton
                color="blue-gray"
                size="sm"
                variant="text"
                onClick={handleOpen}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </IconButton></DialogHeader>
              <hr />
              <form onSubmit={handleSubmit}>
        <DialogBody className='h-[30rem] overflow-scroll'>
        <div style={{ display: 'flex', alignItems: 'center' }}> <Typography variant="h6" color="blue-gray"> Upload a collection logo</Typography>
</div>
<Typography variant="h8" className="mt-1">Media type should be Image or Gif</Typography>
<br />
<div className="flex items-center justify-center w-full">
          {collectionLogo ? (
            <div className="relative mt-4 text-center">
                            <img
                            src={collectionLogo}
                            alt="Preview"
                            style={{ maxHeight: '50rem', maxWidth: '30rem', borderRadius: '0.5rem' }}
                          />

    {/* SVG icon */}
    <Chip variant="ghost" value={collectionLogo.name} className="absolute top-0 left-0 z-10 w-100 h-100 p-1 text-sm text-gray-100 dark:text-white" />
    <svg onClick={handleCollecionChangeClick} className="absolute top-0 right-0 z-10 w-10 h-10 p-1 cursor-pointer rounded-full"  style={{ backgroundColor: "transparent", transition: "background-color 0.3s ease" }}
        onMouseEnter={(e) => e.target.style.backgroundColor = "white"}
        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
</div>

          ) : (
            <>
                  <label htmlFor="collection-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Upload</span> or drag and drop</p>
              </div>
              </label>
            </>
          )}
          <input  id="collection-file" accept="image/jpeg, image/png, image/gif" type="file" className="hidden" onChange={handleCollectionFileChange} onClick={uploadData} />
        </div>
    <br />
    <Typography variant="h6" color="gray"> Name </Typography>
    <br />
    <div className="w-96">
        <Input
          label="Collection Name"
          name="collectionName"
          onChange={handleInputChange}
          required
          minLength={submitted && formData.collectionName.length < 1}
        />
      </div>
    <br />
    <Typography variant="h6" color="gray"> Description </Typography>
    <br />
    <div className="w-96">
      <Input label="Collection Description" name="collectionDescription" size="lg" onChange={handleInputChange} required minLength={submitted && formData.collectionDescription.length < 1} />
    </div>
    <br />
    <Typography variant="h6">
              Maximum number of NFTs in this collection
            </Typography>
    <Typography variant="h6" className="flex items-center" color="gray">
              <Switch
                defaultChecked={supplyEnabled}
                onChange={() => setSupplyEnabled(!supplyEnabled)}
                color="blue"
              />
              <span className="ml-4">Unlimited number of NFTs</span>
            </Typography>
            {supplyEnabled? (
              null
            ): (
                <>
                <br />
                <Typography variant="h6" color="gray">
                  {" "}
                  Limited to{" "}
                </Typography>
                <br />
                <div className="w-96">
                  <Input label="Collection Supply" name="collectionSupply" type="number" onChange={handleInputChange} error={submitted && formData.collectionSupply.length < 1} />
                </div>
              </>
            )}

    <br />
    <Typography variant="h6" color="gray"> Twitter (Optional) </Typography>
    <br />
    <div className="w-96">
      <Input label="Collection Twitter" name="collectionTwitter" size="lg" onChange={handleInputChange} />
    </div>
    <br />
    <Typography variant="h6" color="gray"> Discord (Optional) </Typography>
    <br />
    <div className="w-96">
      <Input label="Collection Discord" name="collectionDiscord" size="lg" onChange={handleInputChange} />
    </div>
    <br />
    <Typography variant="h6" color="gray"> External link (website)  </Typography>
    <br />
    <div className="w-96">
      <Input label="Collection External link" name="collectionExternalLink" size="lg" onChange={handleInputChange}/>
    </div>
    <br />
    <br />
<Typography variant="h6" style={{marginRight: "10px"}}> Reserved Fees : 0.2314 DOT (Refundable)
</Typography>
        </DialogBody>
        <DialogFooter>
        <Button fullWidth color="pink" type="submit" onClick={createCollection}>Create</Button>
        </DialogFooter>
        </form>
      </Dialog>
      
          {file ? (
            <div className="relative mt-4 text-center">
              {fileType.startsWith('image/') && (
            <img
              src={selectedFile}
              alt="Preview"
              style={{ maxHeight: '50rem', maxWidth: '20rem', borderRadius: '0.5rem' }}
            />
          )}
          {fileType.startsWith('video/') && (
            <video
              controls
              src={selectedFile}
              style={{ maxHeight: '50rem', maxWidth: '20rem', borderRadius: '0.5rem' }}
            />
          )}
          {fileType.startsWith('audio/') && (
            <audio controls src={selectedFile} />
          )}
          {fileType === 'text/html' || fileType === 'application/xhtml+xml' ? (
            <iframe src={selectedFile} style={{ maxHeight: '50rem', maxWidth: '20rem', borderRadius: '0.5rem' }} />
          ) : null}

    {/* SVG icon */}
    <Chip variant="ghost" value={file.name} className="absolute top-0 left-0 z-10 w-100 h-100 p-1 text-sm text-gray-100 dark:text-white" />
    <svg onClick={handleChangeClick} className="absolute top-0 right-0 z-10 w-10 h-10 p-1 cursor-pointer rounded-full"  style={{ backgroundColor: "transparent", transition: "background-color 0.3s ease", marginRight: "160px" }}
        onMouseEnter={(e) => e.target.style.backgroundColor = "white"}
        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
</div>

          ) : (
            <>
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Upload</span> or drag and drop</p>
              </div>
              </label>
            </>
          )}
          <form onSubmit={handleCreateNftSubmit}>
          <input
  required
  id="dropzone-file"
  accept="
    image/jpeg, image/png, image/gif, image/svg+xml, image/webp, 
    video/mp4, video/ogg, video/webm, video/quicktime, video/x-msvideo, video/x-matroska,
    audio/mpeg, audio/ogg, audio/wav, audio/webm, audio/aac,
  "
  type="file"
  className="hidden"
  onChange={handleFileChange}
  name="itemFile"
/>

    <br />
    <Typography variant="h6" color="gray"> Name </Typography>
    <br />
    <div className={isMobile? "w-80" : "w-96"}>
      <Input label=" Name" name="itemName"
          onChange={handleInputCreateNftChange}       required
          minLength={nftformData && nftformData.itemName.length < 1} />
    </div>
    <br />
    <Typography variant="h6" color="gray"> Description </Typography>
    <br />
    <div className={isMobile? "w-80" : "w-96"}>
      <Input label=" Description"  size="lg" name="itemDescription"
          onChange={handleInputCreateNftChange}       required
          minLength={nftformData && nftformData.itemDescription.length < 1}/>
    </div>
    <br />
    <Typography variant="h5" color="gray">
    <Switch
                defaultChecked={duplicateEnabled}
                onChange={() => setDuplicateEnabled(!duplicateEnabled)}
                color="pink"
              />
              <span className="ml-4">Duplicate</span>
            </Typography>
              {
                duplicateEnabled? (
                  <>
    <br />
    <div className={isMobile? "w-80" : "w-96"}>
      <Input label="Duplicate"  size="lg" name="duplicate"
          onChange={handleInputCreateNftChange}
          type="number"/>
    </div>
                  </>
                ) : null
              }
    <br />
    <Typography variant="h6" color="gray"> Attributes (optional) </Typography>
    <br />
    {
      isMobile? (
        <>
  <div style={{ marginLeft: '10px',  width: '24px', marginBottom: "10px"  }}>
    <Input
      label="Trait"
      size="lg"
      onChange={handleTraitTypeChange}
    />
  </div>
  <div style={{ display: 'flex', alignItems: 'center' }}>
  <div style={{ marginLeft: '10px' }}>
    <Input
      label="Value"
      size="lg"
      onChange={handleValueChange}
    />
  </div>
<IconButton color="pink" variant="text" style={{marginLeft: "20px"}} onClick={traitType && value? itemAttribute: null}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
        style={{ width: '24px', height: '24px' }} // Ensure SVG fits within the button
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    </IconButton>
    </div> 
        </>
      ) : (
        <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex' }}>
  <div style={{ marginRight: '10px' }}>
    <Input
      label="Trait"
      size="lg"
      onChange={handleTraitTypeChange}
    />
  </div>
  <div style={{ marginLeft: '10px' }}>
    <Input
      label="Value"
      size="lg"
      onChange={handleValueChange}
    />
  </div>
</div> 
<IconButton color="pink" variant="text" style={{marginLeft: "20px"}} onClick={traitType && value? itemAttribute: null}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
        style={{ width: '24px', height: '24px' }} // Ensure SVG fits within the button
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    </IconButton>
</div> 
        </>
      )
    }
<br />
{ addAttribute? (<Card className="h-full w-full overflow-scroll">
      <table className="w-full min-w-max table-auto text-left">
        <thead>
          <tr>
            {TABLE_HEAD.map((head) => (
              <th
                key={head}
                className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
              >
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal leading-none opacity-70"
                >
                  {head}
                </Typography>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {addAttribute.map(({ trait_type, value }, index) => {
            const isLast = index === addAttribute.length - 1;
            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
 
            return (
              <tr key={index}>
                <td className={classes}>
                  <Typography
                    variant="h6"
                    color="pink"
                    className="font-sans"
                  >
                    {trait_type}
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography
                    variant="h6"
                    color="pink"
                    className="font-sans"
                  >
                    {value}
                  </Typography>
                </td>
                <td className={classes}>
                <IconButton color="pink" variant="text" style={{marginLeft: "20px"}} onClick={() => deleteAttribute(index)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"
        style={{ width: '24px', height: '24px' }} // Ensure SVG fits within the button
      >
  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />

      </svg>
    </IconButton>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>) : null}
    <br />
    <div style={{display: "flex", alignItems: "center"}}>
    <Typography variant="h6" style={{marginRight: "10px"}}> Fees : 0.0351 DOT (Refundable)
</Typography>
<Tooltip
      content={
        <div className="w-80">
          <Typography color="white" className="font-medium">
            Metadata Fees for creating NFT
          </Typography>
          <Typography
            variant="small"
            color="white"
            className="font-normal opacity-80"
          >
            Refunded once NFT gets Burned by the owner
          </Typography>
        </div>
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        className="h-5 w-5 cursor-pointer text-blue-gray-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
        />
      </svg>
    </Tooltip>
    </div>
    <br />
    <Button fullWidth color="pink"  type="submit" onClick={createNft} >Create</Button>
    </form>
    <br />
    </div>
        </>
    )
}
