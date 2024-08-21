import React, { useEffect, useState, useRef } from "react";
import '/src/index.css';
import Axios from 'axios';
import {
  Card,
  Typography,
  Spinner,
  IconButton,
  Carousel,
  Input,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { MediaRenderer } from "@thirdweb-dev/react";
import { ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import kus from '/src/assets/COLLECTABLES BY KUS - FINAL - -min.png'

export default function PAHExplore() {
  const [data, setData] = useState([]);
  const [isMobile, setIsMobile] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'volume', direction: 'descending' });

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getData = async () => {
    const response = await Axios.get(`${import.meta.env.VITE_VPS_BACKEND_API}getData`);
    setData(response.data);
    setIsLoading(false);
  };

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

  useEffect(() => {
    getData();
  }, []);

  const TABLE_HEAD = ["Collection", "Volume", "Floor", "Top sale", "Supply", "Listed", "Owners"];

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
  
        // Handle non-numeric fields
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
  
        // Numeric comparison for specific keys
        if (sortConfig.key === 'volume' || sortConfig.key === 'floor' || sortConfig.key === 'highestSale' || sortConfig.key === 'maxSupply' || sortConfig.key === 'nftCount' || sortConfig.key === 'distribution') {
          valA = parseFloat(valA);
          valB = parseFloat(valB);
        }
  
        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);
  

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  

  const handleReload = () => {
    setIsLoading(true);
    setError(false);
    getData();
  };

  return (
    <>
       <Carousel loop={true} autoplay={true} className="sm">
       <a href="https://remarkers-market.vercel.app/Polkadot%20Asset%20Hub/marketplace/165/Collectables%20by%20Kus">
      <img
        src={kus}
        alt="image 2"
        className="h-200 w-full object-cover object-center"
      />
      </a>
    </Carousel>

    <br />
      <div className="relative w-full md:w-1/2">
        <Input
          type="text"
          value={searchTerm}
          color="pink"
          icon={ <MagnifyingGlassIcon color="pink"/>}
          label="Search Collection"
          onChange={handleInputChange}
          placeholder="Search Collection"
          className="pl-10 pr-4 py-2 w-full border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <br />
      <br />
      <br />
      {data.length > 0 ? (
        <Card className={isMobile ? 'max-w-full overflow-scroll' : 'h-full w-full overflow-scroll'}>
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head, index) => (
                  <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal leading-none opacity-70 flex items-center"
                    >
                      {head}
                      <IconButton
                        variant="text"
                        size="sm"
                        color="gray"
                        onClick={() => handleSort(index === 0 ? 'name' : head.toLowerCase().replace(' ', ''))}
                      >
                        {sortConfig.key === (index === 0 ? 'name' : head.toLowerCase().replace(' ', '')) ? (
                          sortConfig.direction === 'ascending' ? (
                            <ArrowUpIcon className="w-4 h-4" />
                          ) : (
                            <ArrowDownIcon className="w-4 h-4" />
                          )
                        ) : (
                          <ArrowUpIcon className="w-4 h-4 opacity-20" />
                        )}
                      </IconButton>
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData
                .filter(({ burned, id, name }) => !burned && id && !id.startsWith('u') && id !== '127' && id !== '161' && name && name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(({ id, name, description, image, owner, maxSupply, distribution, floor, highestSale, royalty, nftCount, createdDate, volume }, index) => {
                  const ipfsHash = image?.replace(/^(ipfs:\/\/ipfs\/|ipfs:\/\/)/, '') || '';
                  const ipfsUri = ipfsHash? `ipfs://${ipfsHash}` : "ipfs://QmVyn3qDGJg4JxV2QbUW4tgiMfV5ho84DbwELFaoyVLtDZ";

                  return name && description && image ? (
                    <tr className="even:bg-blue-gray-50/50 hover:bg-blue-gray-50" key={id}>
<td className="p-4">
  <Link to={`/Polkadot%20Asset%20Hub/marketplace/${id}/${name}`}>
    <div className="card-content-container" style={{ display: 'flex', alignItems: 'center' }}>
      <div className="image-container" style={{ marginRight: '10px' }}>
        {isLoading && !error && (
          <MediaRenderer
            src={"ipfs://QmVyn3qDGJg4JxV2QbUW4tgiMfV5ho84DbwELFaoyVLtDZ"}
            className="card-image"
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '10px',
              display: isLoading || error ? 'none' : 'block',
            }}
            alt=""
          />
        )}
        <MediaRenderer
          src={ipfsUri}
          className="card-image"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '10px',
            display: isLoading || error ? 'none' : 'block',
          }}
          alt=""
          onLoad={() => setIsLoading(false)}
        />
      </div>
      <div className="text-container" style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <Typography color="blue-gray" className="font-medium font-bold card-content">
          {name}
        </Typography>
      </div>
    </div>
  </Link>
</td>
<td className="p-4">
  <Typography variant="h7" color="gray" className="font-normal">
    {volume} DOT
  </Typography>
</td>

                      <td className="p-4">
                        <Typography as="a" href="#" variant="h7" color="gray" className="font-medium">
                          {floor} DOT
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography as="a" href="#" variant="h7" color="gray" className="font-medium">
                          {highestSale} DOT
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography as="a" href="#" variant="h7" color="gray" className="font-medium">
                          {maxSupply ? maxSupply : nftCount}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography as="a" href="#" variant="h7" color="gray" className="font-medium">
                          {nftCount}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography as="a" href="#" variant="h7" color="gray" className="font-medium">
                          {distribution}
                        </Typography>
                      </td>
                    </tr>
                  ) : null;
                })}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="flex justify-center items-start h-screen">
          <div className="flex justify-center items-center w-full mt-20">
          <Spinner className="h-8 w-8" color="pink" />
          </div>
        </div>
      )}
    </>
  );
}