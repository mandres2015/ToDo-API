const bcrypt = require("bcryptjs");

const salt = async () => await bcrypt.genSalt(10);

exports.encrypt = async (text) => await bcrypt.hash(text, await salt());

exports.compare = async (textA, textB) => await bcrypt.compare(textA, textB);
