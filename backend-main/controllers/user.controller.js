const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
};

const signUp = async (req, res) => {
  // const { name, email, password, password_confirm } = req.body
  let { role, name, address, bio, email, phone, username, password, token } =
    req.body;
  name = name.trim();
  address = address ? address.trim() : null;
  bio = bio ? bio.trim() : null;
  email = email.trim();
  phone = phone.trim();
  username = username.trim();
  password = password.trim();
  token = token ? token.trim() : null;

  if (
    name == "" ||
    address == "" ||
    email == "" ||
    phone == "" ||
    username == "" ||
    password == ""
  ) {
    res.json({
      status: "FAILED",
      message: "Empty input fileds!",
    });
  } else if (!/^[a-zA-Z ]*$/.test(name)) {
    res.json({
      status: "FAILED",
      message: "Invalid name entered",
    });
  } else if (!/^[\w\.\-]+@([\w\-]+\.)+[\w\-]{2,4}$/.test(email)) {
    res.json({
      status: "FAILED",
      message: "Invalid email entered",
    });
  }
  // else if (!new Date(dateOfBirth).getTime()) {
  //   res.json({
  //     "status": "FAILED",
  //     "message": "Invalid date of birth entered",
  //   });
  // }
  else if (password.length < 8) {
    res.json({
      status: "FAILED",
      message: "Password is too short!",
    });
  } else {
    User.findAll({
      where: {
        [Op.or]: [{ email: email }, { phone: phone }, { username: username }],
      },
    }).then((result) => {
      if (result.length) {
        res.json({
          status: "FAILED",
          message:
            "User with the provided email or phone number or username already exists",
        });
      } else {
        const saltRounds = 10;
        bcrypt
          .hash(password, saltRounds)
          .then((hashedPassword) => {
            const newUser = new User({
              role,
              name,
              address,
              bio,
              email,
              phone,
              username,
              password: hashedPassword,
              token,
            });

            newUser
              .save()
              .then((result) => {
                res.json({
                  status: "SUCCESS",
                  message: "Signup successful!",
                  data: result,
                });
              })
              .catch((err) => {
                res.json({
                  status: "FAILED",
                  message: "An error occrurred while saving user account!",
                });
              });
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: "FAILED",
              message: "An error while checking for existing user!",
            });
          });
      }
    });
  }
};

// const signIn = async (req, res) => {
//   let {email, passsword} = 
// }
// const createUser = async (req, res) => {
//   try {
//     const hashedPassword = await bcrypt.hash(req.body.password, 10);
//     req.body.
//     const user = await User.create(req.body);
//     res.status(201).json(user);
//   } catch (error) {
//     res.status(500).json({ error: "Error creating user" });
//   }
// };



// router.get("/", async (req, res) => {
//   try {
//     const users = await User.findAll();
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching users" });
//   }
// });

// // Tạo người dùng mới
// router.post("/", async (req, res) => {
//   try {
//     const user = await User.create(req.body);
//     res.status(201).json(user);
//   } catch (error) {
//     res.status(500).json({ error: "Error creating user" });
//   }
// });

module.exports = {
  signUp,
  getAllUsers,
};
