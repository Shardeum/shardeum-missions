import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import { Fragment, useEffect, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { USDTLogo } from "../components/icons";
import { ethers } from "ethers";
import ContractAbi from "../artifacts/contracts/OrderBookDex.sol/OrderBookDex.json";

export default function Home() {
  const tokens = [
    { id: 1, name: "USDT" },
    { id: 2, name: "BTC" },
  ];

  const [convertFrom, setConvertFrom] = useState(tokens[0]);
  const [converTo, setConverTo] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const [walletAddress, setWalletAddress] = useState("");

  const [query, setQuery] = useState("");

  const filteredtokens =
    query === ""
      ? tokens
      : tokens.filter((person) =>
          person.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  useEffect(() => {
    setToAmount(getUsdtBtcPrice());
  }, [convertFrom]);

  const getUsdtBtcPrice = async () => {
    const abi = [
      {
        inputs: [
          { internalType: "string", name: "marketPair", type: "string" },
        ],
        name: "checkPrice",
        outputs: [
          { internalType: "int256", name: "price", type: "int256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
    ];
    const contractAddress = "0x700a89Ba8F908af38834B9Aba238b362CFfB665F";
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);

    const price = await contract.checkPrice("eth_usdt");

    return ethers.utils.formatEther(price.price);
  };

  const loginWithMetaMask = async () => {
    if (typeof window.ethereum == "undefined") {
      alert("Metamask Not Found");
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    console.log(accounts);

    setWalletAddress(accounts[0]);
  };

  const checkAccount = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    if (accounts[0]) {
      setWalletAddress(accounts[0]);
    } else {
      setWalletAddress("");
    }
  };

  useEffect(() => {
    checkAccount();
  }, []);

  const swapTokens = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      contractAddress,
      ContractAbi.abi,
      signer
    );

    console.log("USDT Address", process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS);
    console.log("BTC Address", process.env.NEXT_PUBLIC_BTC_TOKEN_ADDRESS);
    // return;

    const getUSDTPRICE = await contract.getUsdtBtcPrice();
    console.log(getUSDTPRICE);
    await contract.swap(
      walletAddress,
      convertFrom.name == "USDT"
        ? process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS
        : process.env.NEXT_PUBLIC_BTC_TOKEN_ADDRESS,
      converTo.name == "BTC"
        ? process.env.NEXT_PUBLIC_BTC_TOKEN_ADDRESS
        : process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS,
      ethers.utils.parseUnits("1")
    );
  };

  return (
    <div>
      <Head>
        <title>OrderBookDex</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-black grid place-items-center">
        <div
          style={{ width: 500 }}
          className="bg-slate-800 rounded-lg mt-32 border-2 shadow-lg border-cyan-500 p-5 shadow-cyan-400"
        >
          <h1 className="font-bold">Supra Swap</h1>

          <div className="mt-10 flex flex-col">
            <div className="w-full text-2xl h-20 rounded-lg bg-slate-700 px-3 flex">
              <input
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-full outline-none bg-transparent"
                type={"number"}
              />
              <Combobox value={convertFrom} onChange={setConvertFrom}>
                <div className="relative mt-1">
                  <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                    <Combobox.Input
                      className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                      displayValue={(token) => token.name}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                      {convertFrom.name == "USDT" ? (
                        <div>USDT</div>
                      ) : (
                        <div>BTC</div>
                      )}
                    </Combobox.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery("")}
                  >
                    <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {filteredtokens.length === 0 && query !== "" ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                          Nothing found.
                        </div>
                      ) : (
                        filteredtokens.map((token) => (
                          <Combobox.Option
                            key={token.id}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active
                                  ? "bg-teal-600 text-white"
                                  : "text-gray-900"
                              }`
                            }
                            value={token}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? "font-medium" : "font-normal"
                                  }`}
                                >
                                  {token.name}
                                </span>
                                {selected ? (
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                      active ? "text-white" : "text-teal-600"
                                    }`}
                                  >
                                    {/* <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    /> */}
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </Transition>
                </div>
              </Combobox>
            </div>
            <div className="w-full mt-10 text-2xl h-20 rounded-lg bg-slate-700 px-3 flex">
              <input
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-full outline-none bg-transparent"
                type={"number"}
              />
              <Combobox value={converTo} onChange={setConverTo}>
                <div className="relative mt-1">
                  <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                    <Combobox.Input
                      className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                      displayValue={(token) => token.name}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                      {converTo.name == "USDT" ? (
                        <div>USDT</div>
                      ) : (
                        <div>BTC</div>
                      )}
                    </Combobox.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery("")}
                  >
                    <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {filteredtokens.length === 0 && query !== "" ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                          Nothing found.
                        </div>
                      ) : (
                        filteredtokens.map((token) => (
                          <Combobox.Option
                            key={token.id}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active
                                  ? "bg-teal-600 text-white"
                                  : "text-gray-900"
                              }`
                            }
                            value={token}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? "font-medium" : "font-normal"
                                  }`}
                                >
                                  {token.name}
                                </span>
                                {selected ? (
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                      active ? "text-white" : "text-teal-600"
                                    }`}
                                  >
                                    {/* <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    /> */}
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </Transition>
                </div>
              </Combobox>
            </div>

            {walletAddress ? (
              <button
                onClick={swapTokens}
                className="w-full h-20 bg-cyan-500 rounded-lg mt-10"
              >
                Swap
              </button>
            ) : (
              <button
                onClick={loginWithMetaMask}
                className="w-full h-20 bg-cyan-500 rounded-lg mt-10"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
