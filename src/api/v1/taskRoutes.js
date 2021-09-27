const express = require("express");
const router = express.Router();
const {
  getTasks,
  saveTask,
  deleteAllTasks,
  deleteOneTask,
  doneTask,
  saveNewUser,
  checkLogin,
  getUserInfo,
} = require("../../db/database");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");
require("dotenv").config();
const secretPhrase = process.env.SECRET_TOKEN_PHRASE;

router.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (password.length < 6)
    res.status(204).send("La contraseña debe tener al menos 6 caracteres");
  try {
    const userSaved = await saveNewUser({ email, password });
    if (!userSaved.saved) {
      if (userSaved.error) res.status(500).send("Error in Saving");
      else res.status(204).send("Usuario ya existe");
    }

    const { id } = userSaved;

    const payload = {
      user: {
        uid: id,
      },
    };
    const token = jwt.sign(payload, secretPhrase, { expiresIn: "1H" });

    res.status(200).json({
      token,
    });
  } catch (err) {
    res.status(500).send("Error in Saving");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userLogin = await checkLogin(email, password);

    if (userLogin.hasOwnProperty("exists") && !userLogin.exists)
      return res.status(204).send("User not exists");
    if (userLogin.hasOwnProperty("match") && !userLogin.match)
      return res.status(204).send("Password incorrect");
    if (userLogin.error) throw new Error();

    const payload = {
      user: {
        uid: userLogin.id,
      },
    };

    const token = jwt.sign(payload, secretPhrase, { expiresIn: "1H" });

    res.status(200).json({
      token,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

// Home page route.
router.get("/tasks", auth, async (req, res) => {
  const { uid } = req.user;
  res.send({ data: await getTasks(uid) });
});

router.post("/save", auth, async (req, res) => {
  const { data: task } = req.body;
  const { uid } = req.user;
  const alarm = task.date && task.time && new Date(task.date + " " + task.time);
  task.alarm = alarm;
  if (task.title) res.send(JSON.stringify(await saveTask({ uid, task })));
  else res.send(JSON.stringify({ status: 204 }));
});

router.get("/update", auth, async (req, res) => {
  const { uid } = req.user;
  res.send(JSON.stringify(await deleteOneTask(uid)));
});

router.get("/deleteAll", auth, async (req, res) => {
  const { uid } = req.user;
  res.send(JSON.stringify(await deleteAllTasks(uid)));
});

router.post("/deleteOne", auth, async (req, res) => {
  const { data } = req.body;
  const { uid } = req.user;
  if (data.id) res.send(JSON.stringify(await deleteOneTask(uid, data.id)));
  else res.send(JSON.stringify({ status: 204 }));
});

router.post("/doneTask", auth, async (req, res) => {
  const { data } = req.body;
  const { uid } = req.user;
  if (data.id && typeof data.done === "boolean")
    res.send(JSON.stringify(await doneTask(uid, data.id, data.done)));
  else res.send(JSON.stringify({ status: 204 }));
});

router.get("/setAlarm", auth, async (req, res) => {
  const { uid } = req.user;
  res.send(JSON.stringify(await deleteOneTask(uid)));
});

module.exports = router;
