
export const eventTypeAnalyzer = (req) => {
  let prepend = '/api/v1';
  let eventType = "Request";

  if (req.path === '/product') {
    eventType = 'Product List Page Visit';
  } else if (/\/product\/[0-9a-fA-F]{24}/.test(req.url) && req.method === 'GET') {
    eventType = 'Product Details View';  
  } else if (/\/product\/[0-9a-fA-F]{24}/.test(req.url) && req.method === 'PUT') {
    eventType = 'Product Update';  
  } else if (req.originalUrl === prepend + '/order/new') {
    eventType = 'Order Placed';
  } else if (/\/order\/single\/[0-9a-fA-F]{24}/.test(req.url) && req.method === 'PUT') {
    eventType = 'Order Status Updated';
  } else if (/\/order\/[0-9a-fA-F]{24}/.test(req.url) && req.method === 'GET') {
    eventType = 'Order Details View'
  } else if (/\/cart\/[0-9a-fA-F]{24}/.test(req.url) && req.method === 'GET') {
    eventType = 'Visited Cart';
  } else if (req.originalUrl === prepend + '/cart') {
    eventType = 'Created Cart';
  } else if (/\/cart\/[0-9a-fA-F]{24}/.test(req.url) && req.method === 'PUT') {
    eventType = 'Updated Cart';
  } else if (/\/cart\/[0-9a-fA-F]{24}/.test(req.url) && req.method === 'DELETE') {
    eventType = 'Deleted Cart';
  } 
  return eventType;
}