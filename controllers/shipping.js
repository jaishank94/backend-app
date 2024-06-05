import { asyncError } from "../middlewares/error.js";
import axios from 'axios';

const baseUrl = 'https://apiv2.shiprocket.in/v1';

export const generateToken = asyncError(async (req, res, next) => {
  try {
    const login = await axios.post(`${baseUrl}/external/auth/login`, 
      { email: "jai.shankar@sosuvconsulting.com", password: "W3!com3" }, 
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return res.status(200).send({ success: true, data: login.data });
  } catch (error) {
    return res.status(error.response.data.status_code || 400).send({ success: false, message: (error.response ? error.response.data : error.message) });
  }
});

export const checkServiceability = asyncError(async (req, res, next) => {
  const { shiprocket_token } = req.headers;
  const headers = { 'Authorization': shiprocket_token, 'Content-Type': 'application/json' };
  const { pickupPostalCode, deliveryPostalCode, orderId, cod, weight, length, breadth, height, declaredValue, mode,isReturn = 0 } = req.query;
  if (!orderId && (!weight || !cod)) {
    return res.status(400).send({ success: false, message: `One of either the 'orderId' or 'cod' and 'weight' is required.` })
  };
  const params = {
    pickup_postcode: pickupPostalCode,
    delivery_postcode: deliveryPostalCode,
    order_id: orderId || null,
    cod: cod || null,
    weight: weight || null,
    length: length || null, 
    breadth: breadth || null, 
    height: height || null, 
    declared_value: declaredValue || null, 
    mode: mode || null, 
    is_return: isReturn || null,
  };
  try {
    const serviceability = await axios.get(`${baseUrl}/external/courier/serviceability`, 
      {
        headers, params
      }
    );
    return res.status(200).send({ success: true, data: serviceability.data });
  } catch (error) {
    return res.status(error.response.data.status_code || 400).send({ success: false, message: (error.response ? error.response.data : error.message) });
  }
});

export const courierListWithCounts = asyncError(async (req, res, next) => {
  const { shiprocket_token } = req.headers;
  const headers = { 'Authorization': shiprocket_token, 'Content-Type': 'application/json' };
  try {
    const couriers = await axios.get(`${baseUrl}/external/courier/courierListWithCounts`, 
      {
        headers,
      }
    );
    return res.status(200).send({ success: true, data: couriers.data });
  } catch (error) {
    return res.status(400).send({ success: false, message: error });
  }
});

export const createCustomOrder = asyncError(async (req, res, next) => {
  const { shiprocket_token } = req.headers;

  const { orderId, orderDate, pickupLocation, billingCustomerName, billingLastName, billingAddress, billingAddress2, billingCity, billingPincode, billingState, billingCountry, billingEmail, billingPhone, shippingIsBilling, shippingCustomerName, shippingLastName, shippingAddress, shippingAddress2, shippingCity, shippingPincode, shippingCountry, shippingState, shippingEmail, shippingPhone, orderItems, paymentMethod, shippingCharges, giftwrapCharges, transactionCharges, totalDiscount, subTotal, length, breadth, height, weight } = req.body;

  const data = {
    order_id: orderId,
    order_date: orderDate,
    pickup_location: pickupLocation,
    billing_customer_name: billingCustomerName,
    billing_last_name: billingLastName,
    billing_address: billingAddress,
    billing_address_2: billingAddress2,
    billing_city: billingCity,
    billing_pincode: billingPincode,
    billing_state: billingState,
    billing_country: billingCountry,
    billing_email: billingEmail,
    billing_phone: billingPhone,
    shipping_is_billing: shippingIsBilling,
    shipping_customer_name: shippingCustomerName,
    shipping_last_name: shippingLastName,
    shipping_address: shippingAddress,
    shipping_address_2: shippingAddress2,
    shipping_city: shippingCity,
    shipping_pincode: shippingPincode,
    shipping_country: shippingCountry,
    shipping_state: shippingState,
    shipping_email: shippingEmail,
    shipping_phone: shippingPhone,
    order_items: orderItems,
    payment_method: paymentMethod,
    shipping_charges: shippingCharges,
    giftwrap_charges: giftwrapCharges,
    transaction_charges: transactionCharges,
    total_discount: totalDiscount,
    sub_total: subTotal,
    length,
    breadth,
    height,
    weight
  };
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${shiprocket_token}`
  };
  try {
    const response = await axios.post(`${baseUrl}/external/orders/create/adhoc`, data, { headers });
    return res.status(200).send({ success: true, data: response.data });
  } catch (error) {
    return res.status(error.response.data.status_code || 400).send({ success: false, message: (error.response ? error.response.data : error.message) });

  }
});

export const getShippingOrders = asyncError(async (req, res, next) => {
  const { shiprocket_token } = req.headers;
  const headers = { 'Authorization': shiprocket_token, 'Content-Type': 'application/json' };
  try {
    const shippingOrders = await axios.get(`${baseUrl}/external/orders`, 
      {
        headers,
      }
    );
    return res.status(200).send({ success: true, data: shippingOrders.data.data });
  } catch (error) {
    return res.status(400).send({ success: false, message: error });
  }
});

export const getShippingOrdersDetails = asyncError(async (req, res, next) => {
  const { shiprocket_token } = req.headers;
  const { orderId } = req.params;
  const headers = { 'Authorization': shiprocket_token, 'Content-Type': 'application/json' };
  try {
    const shippingOrder = await axios.get(`${baseUrl}/external/orders/show/${orderId}`, 
      {
        headers,
      }
    );
    return res.status(200).send({ success: true, data: shippingOrder.data.data });
  } catch (error) {
    return res.status(400).send({ success: false, message: error });
  }
});