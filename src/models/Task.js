module.exports = class Task {
  constructor(task) {
    if (task) {
      console.log(task);
      const { title, description, done = false, alarm = null, status = "A" } = task;
      this.title = title;
      this.description = description;
      this.done = done;
      this.alarm = alarm;
      this.status = status;
    }
  }

  getModel() {
    return {
      title: String,
      description: String,
      done: Boolean,
      alarm: Date,
      status: String,
    };
  }
};
