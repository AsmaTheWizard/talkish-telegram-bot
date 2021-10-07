const Customer = require("./models/Customer");
const Feedback = require("./models/Feedback");

export interface Customer {
  chat_id: string;
  name: string;
  mobile_number: string;
  latitude?: number;
  longitude?: number;
}

export interface Feedback {
  chat_id: string;
  name: string;
  mobile_number: string;
}

//Feedback

export const getAllFeedback = async (): Promise<Feedback[]> => {
  return Feedback.find();
};

export const createFeedback = async (fe: any): Promise<void> => {
  let feed = new Feedback({
    ...fe,
  });
  feed.save().then(() => console.log("ADDED"));
};

//Customer
export const getAllCustomers = async (): Promise<Customer[]> => {
  return Customer.find();
};

export const checkIfCustomerExist = async (
  chat_id: string
): Promise<Boolean> => {
  let doesUserExit = false;
  const result = await Customer.findOne({ chat_id: chat_id })
    .select("_id")
    .lean();
  if (result) {
    doesUserExit = true;
  }
  return doesUserExit;
};

export const createCustomer = async (customer: any): Promise<void> => {
  let customer_info = new Customer({
    ...customer,
  });
  customer_info.save().then(() => console.log("ADDED"));
};
