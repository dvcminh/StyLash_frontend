import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { face } from "phosphor-react";
import axios from "axios";
import AuthService from "../../Auth/AuthService";
import { AuthContext } from "../../components/Context/AuthContext";
import Loading from "../Loading/loading";
import { NotificationContext } from "../../components/Context/NotificationContext";

import "./product.css";

const Product = () => {
  const authContext = useContext(AuthContext);
  const { setNotification } = useContext(NotificationContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [heartColor, setHeartColor] = useState("gray");
  const [liked, setLiked] = useState(false);
  const [hearthColor, setHearthColor] = useState();
  const [color, setColor] = useState("Black");
  const [size, setSize] = useState("SM");
  const [countLike, setCountLike] = useState(0);
  const [isBlackClicked, setIsBlackClicked] = useState(true);
  const [isWhiteClicked, setIsWhiteClicked] = useState(false);

  const handleBlackClick = () => {
    setIsBlackClicked(true);
    setIsWhiteClicked(false);
    setColor("Black");
  };

  const handleWhiteClick = () => {
    setIsBlackClicked(false);
    setIsWhiteClicked(true);
    setColor("White");
  };

  const loadLikeProduct = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/products/countLike/${id}`
      );
      const data = response.data;
      setCountLike(data);
    } catch (error) {
      alert(error);
    }
  };
  const fetchLikeProduct = async () => {
    try {
      const accessToken = authContext.getAccessToken(); // Lấy token JWT từ localStorage
      const response = await axios.get(
        `http://localhost:8080/api/products/checkLikedProduct`,
        {
          params: {
            productId: id,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = response.data;
      console.log(data);
      setLiked(data);
    } catch (error) {
      console.log(error);
    }
  };

  //hàm mới vô load để xem người dùng đã like sản phẩm hay chưa
  useEffect(() => {
    fetchLikeProduct();
    loadLikeProduct();
  }, [liked]);

  // useEffect(() => {
  //   const fetchLikeProduct = async () => {
  //     try {
  //       const response = await axios.get(
  //         `http://localhost:8080/api/products/countLike/${id}`
  //       );
  //       const data = response.data;
  //       setCountLike(data);
  //     } catch (error) {
  //       alert(error);
  //     }
  //   };
  //   fetchLikeProduct();
  // }, [liked]);

  useEffect(() => {
    setHearthColor(liked ? "#00ADB5" : "gray");
  }, [liked]);

  const handleClick = async () => {
    if (authContext.isLoggedIn === false) {
      setNotification({
        isOpen: true,
        message: "Please login to continue",
        type: "error",
      });
      return;
    }
    try {
      const accessToken = AuthService.getAccessToken(); // Lấy token JWT từ localStorage
      const response = await axios.post(
        `http://localhost:8080/api/products/${id}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = response.data;
      setLiked(data);
      if (data) {
        setNotification({
          isOpen: true,
          message: "Added to wishlist",
          type: "success",
        });
      } else {
        setNotification({
          isOpen: true,
          message: "Removed from wishlist",
          type: "error",
        });
      }
    } catch (error) {}
  };

  useEffect(() => {
    // const fetchProduct = async () => {
    //   const response = await fetch(`https://fakestoreapi.com/products/${id}`)
    //   const data = await response.json()
    //   console.log(data)
    //   setProduct(data)
    // }
    // fetchProduct()

    const fetchProducts = async () => {
      try {
        const accessToken = authContext.getAccessToken(); // Lấy token JWT từ localStorage
        const response = await axios.get(
          `http://localhost:8080/api/products/${id}`
        );
        const data = response.data;
        setProduct(data);
      } catch (error) {}
    };
    fetchProducts();
  }, []);

  const handleCart = (product, redirect) => {
    if (authContext.isLoggedIn === false) {
      setNotification({
        isOpen: true,
        message: "Please login to continue",
        type: "error",
      });
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const isProductExist = cart.find(
      (item) =>
        item.id === product.id && item.color === color && item.size === size
    );
    if (isProductExist) {
      const updatedCart = cart.map((item) => {
        if (
          item.id === product.id &&
          item.color === color &&
          item.size === size
        ) {
          return {
            ...item,
            quantity: item.quantity + 1,
          };
        }
        return item;
      });
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } else {
      localStorage.setItem(
        "cart",
        JSON.stringify([...cart, { ...product, quantity: 1, color, size }])
      );
    }
    setNotification({
      isOpen: true,
      message: "Added to cart",
      type: "success",
    });
    if (redirect) {
      navigate("/cart");
    }
  };

  // if (!Object.keys(product).length > 0) return <div>Loading.....</div>
  if (!Object.keys(product).length > 0) return <Loading size={50} />;

  return (
    <section className="text-gray-600 body-font overflow-hidden">
      <div className="container px-5 py-24 mx-auto">
        <div className="lg:w-4/5 mx-auto flex flex-wrap">
          <img
            alt="image"
            className="lg:w-1/2 w-full lg:h-auto max-h-[600px] h-64 object-contain object-center rounded"
            src={product?.image_url}
          />
          <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
            <h2 className="text-sm title-font tracking-widest uppercase category">
              {product?.category.name}
            </h2>
            <h1 className="text-gray-900 text-3xl title-font font-medium mb-1 title">
              {product?.name}
            </h1>
            <div className="flex mb-4">
              <span className="flex items-center">
                <span className="flex ml-3 pl-3 py-2 border-l-2 border-gray-200 space-x-2s" />
                <span className="text">{countLike} Likes</span>
              </span>
            </div>
            <p className="leading-relaxed">{product?.description}</p>
            <div className="flex mt-6 items-center pb-5 border-b-2 border-gray-100 mb-5">
              <div className="flex">
                <span className="mr-3">Color</span>
                <button
                  className={`border-2 border-gray-300 rounded-full w-6 h-6 focus:outline-none ${
                    isBlackClicked ? "border-2 border-sky-500" : "button-black"
                  }`}
                  onClick={handleBlackClick}
                ></button>
                <button
                  className={`border-2 border-gray-300 ml-1 bg-white rounded-full w-6 h-6 focus:outline-none ${
                    isWhiteClicked ? "border-2 border-sky-500" : "button-white"
                  }`}
                  onClick={handleWhiteClick}
                ></button>
              </div>
              <div className="flex ml-6 items-center">
                <span className="mr-3">Size</span>
                <div className="relative">
                  <select className="rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10">
                    <option onClick={() => setSize("SM")}>SM</option>
                    <option onClick={() => setSize("M")}>M</option>
                    <option>L</option>
                    <option>XL</option>
                  </select>
                  <span className="absolute right-0 top-0 h-full w-10 text-center text-gray-600 pointer-events-none flex items-center justify-center">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="title-font font-medium text-2xl text-white">
                ${product?.price}
              </span>
              <div className=" flex">
                <button
                  className="flex ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded mr-2"
                  onClick={() => handleCart(product, true)}
                >
                  Buy it now
                </button>
                <button
                  className="flex ml-auto border border-indigo-500 py-2 px-6 focus:outline-none hover:bg-indigo-600 hover:text-white rounded"
                  onClick={() => handleCart(product)}
                >
                  Add to cart
                </button>
                {/* <button className="flex ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded mr-2">Buy it now</button>
                  <button className="flex ml-auto border border-indigo-500 py-2 px-6 focus:outline-none hover:bg-indigo-600 hover:text-white rounded">Add to cart</button> */}
              </div>
              <button
                className="rounded-full w-10 h-10 bg-gray-200 p-0 border-0 inline-flex items-center justify-center text-gray-500 ml-4"
                onClick={handleClick}
              >
                <svg
                  fill={hearthColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Product;
