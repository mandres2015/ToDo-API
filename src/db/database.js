const mongoose = require("mongoose");
const Task = require("../models/Task");
const bcrypt = require("bcryptjs");

const taskSchema = new mongoose.Schema(new Task().getModel());
const User = require("../models/User");
const { encrypt, compare } = require("../helpers/encrypt");
require("dotenv").config();
const dbUrl = process.env.DB_URL;

const connection = async () => {
  // const db = undefined;
  if (mongoose.connection.readyState == 0) {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    if (mongoose.connection.readyState == 1) console.log("Connected");
    mongoose.connection.on("error", (err) => {
      logError(err);
    });
    return mongoose.connection;
  } else {
    return mongoose.connection;
  }
};

const taskModel = async (uid) => {
  return mongoose.model("Task", taskSchema, `tasks_${uid}`);
};

const close = async () => {
  mongoose
    .disconnect()
    .then(console.log("closed"))
    .catch((err) => log.error(err));
};

exports.saveNewUser = async ({ username = "a", email, password }) => {
  try {
    await connection();

    console.log(username, email, password);

    let user = await User.findOne({
      email,
    });
    if (user) return { saved: false };

    user = new User({
      username,
      email,
      password,
    });

    user.password = await encrypt(password);

    await user.save();

    return { saved: true, id: user.id };
  } catch (err) {
    await close();
    console.error("Error:" + err);
    return { saved: false, error: 500 };
  }
};

exports.checkLogin = async (email, password) => {
  try {
    await connection();

    let user = await User.findOne({
      email,
    });

    if (!user) return { exists: false };

    const isMatch = await compare(password, user.password);
    if (!isMatch) return { match: false };

    return { exists: true, match: true, id: user.id };
  } catch (err) {
    await close();
    console.error("Error:" + err);
    return { error: 500 };
  }
};

exports.getUserInfo = async (id) => {
  try {
    await connection();

    const user = await User.findById(id);

    return { user };
  } catch (err) {
    await close();
    console.error("Error:" + err);
    return { error: 500 };
  }
};

exports.getTasks = async (uid) => {
  try {
    await connection();

    if (!uid) return [];

    const Task = await taskModel(uid);

    const tasks = await Task.find({ status: "A" });

    return tasks;
  } catch (err) {
    await close();
    console.error("Error:" + err);
    return [];
  }
};

exports.saveTask = async ({ uid, task }) => {
  if (task.title.trim().length <= 0) return;

  if (!uid) return [];

  let exists = false;

  await connection();

  const modelTask = await taskModel(uid);

  const newTask = new Task(task);

  exists = task.id && (await modelTask.exists({ _id: task.id }));

  if (exists) await modelTask.updateOne({ _id: task.id }, newTask);
  else await modelTask.create(newTask);

  return newTask;
};

exports.deleteAllTasks = async (uid) => {
  await connection();

  const modelTask = await taskModel(uid);

  const res = await modelTask.updateMany({}, { status: "D" });

  return res.nModified;
};

exports.deleteOneTask = async (uid, id) => {
  await connection();

  const modelTask = await taskModel(uid);

  const res = await modelTask.updateOne({ _id: id }, { status: "D" });

  return res.nModified;
};

exports.updateTask = async (task) => {
  await connection();

  const modelTask = await taskModel(uid);

  const newTask = task;

  const res = await modelTask.updateOne({ _id: "" }, newTask);

  return res.nModified;
};

exports.updateAlarm = async () => {
  await connection();

  const modelTask = await taskModel(uid);

  const res = await modelTask.updateOne({ _id: "" }, { alarm: new Date() });

  return res.nModified;
};

exports.doneTask = async (uid, id, done) => {
  await connection();

  const modelTask = await taskModel(uid);

  const res = await modelTask.updateOne({ _id: id }, { done: !done });

  return res.nModified;
};
