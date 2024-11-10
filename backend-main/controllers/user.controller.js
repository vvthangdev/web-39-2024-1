const User = require("../models/user.model");
// const bcrypt = require("bcrypt");
require("dotenv").config();
const { Op } = require("sequelize");
const randToken = require("rand-token");
const userService = require("../services/user.service");
const authUtil = require("../utils/auth.util");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
};

const signUp = async (req, res) => {
  let {
    role,
    name,
    address,
    bio,
    email,
    phone,
    username,
    password,
    refresh_token,
  } = req.body;

  try {
    const newUser = await userService.createUser({
      role,
      name,
      address,
      bio,
      email,
      phone,
      username,
      password,
      refresh_token,
    });
    return res.json({
      status: "SUCCESS",
      message: "Signup successful!",
      data: newUser,
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: "FAILED",
      message: "An error occurred during sign up!",
    });
  }
};

// const login = async (req, res) => {
//   let { username, password } = req.body;
//   try {
//     const user = await userService.getUserByUserName(username);

//     const isPasswordValid = await userService.validatePassword(
//       password,
//       user.password
//     );
//     if (!isPasswordValid) {
//       return res.status(401).send("Password incorrect!");
//     }

//     const dataForAccessToken = {
//       username: user.username,
//       // Trong trường hợp người dùng đăng nhập cung cấp nhiều thông tin
//       // hơn thì ta có thể đặt thêm những trường khác vào đây
//     };

//     const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
//     const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

//     const accessToken = await authUtil.generateToken(
//       dataForAccessToken,
//       accessTokenSecret,
//       accessTokenLife
//     );
//     if (!accessToken) {
//       return res.status(401).send("Login not successful!");
//     }
//     userService.updateAccessToken(user.username, accessToken);
//     res.json({
//       status: "SUCCESS",
//       message: "Login successful!",
//       token: `Bearer ${accessToken}`,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send("An error occurred during login!");
//   }
// };

const login = async (req, res) => {
  let { username, password } = req.body;
  try {
    const user = await userService.getUserByUserName(username);

    const isPasswordValid = await userService.validatePassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).send("Password incorrect!");
    }

    const dataForAccessToken = {
      username: user.username,
      // Thêm các thông tin khác nếu cần
    };

    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    const accessToken = await authUtil.generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    );
    if (!accessToken) {
      return res.status(401).send("Login not successful!");
    }

    // **Tạo refresh token**
    const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    const refreshToken = await authUtil.generateToken(
      dataForAccessToken,
      refreshTokenSecret,
      refreshTokenLife
    );
    if (!refreshToken) {
      return res.status(401).send("Login not successful!");
    }

    // **Lưu refresh token vào cơ sở dữ liệu**
    await userService.updateRefreshToken(user.username, refreshToken);

    res.json({
      status: "SUCCESS",
      message: "Login successful!",
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("An error occurred during login!");
  }
};

const refreshToken = async (req, res) => {
  // Lấy refresh token từ header
  // const refreshToken = req.headers["authorization"];
  const refreshToken = req.headers["authorization"]?.split(" ")[1];

  // Kiểm tra nếu không có refresh token trong header
  if (!refreshToken) {
    return res.status(403).send("Refresh token is required!");
  }

  try {
    // Lấy secret của refresh token từ biến môi trường
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    // Xác minh refresh token
    const decoded = await authUtil.verifyToken(
      refreshToken,
      refreshTokenSecret
    );

    // Tạo data cho access token mới
    const dataForAccessToken = { username: decoded.username };

    // Thiết lập thời gian sống và secret cho access token
    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    // Sinh access token mới
    const newAccessToken = await authUtil.generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    );

    // Gửi lại access token mới cho client
    res.json({
      status: "SUCCESS",
      accessToken: `Bearer ${newAccessToken}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).send("Invalid refresh token!");
  }
};

module.exports = { getAllUsers, signUp, login, refreshToken };
