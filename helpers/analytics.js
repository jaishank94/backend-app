
export const eventTypeAnalyzer = (req) => {
  let eventType = "Request";
  if (req.path === '/product') {
    eventType = 'Product List Page Visit';
  } else if (/\/product\/[0-9a-fA-F]{24}/.test(req.url) && req.method === 'GET') {
    eventType = 'Product Details View';  
  } else if (/\/product\/[0-9a-fA-F]{24}/.test(req.url) && req.method === 'PUT') {
    eventType = 'Product Update';  
  } else if (req.path === '/order') {
    eventType = 'Order List Page Visit';
  } else if (/\/order\/[0-9a-fA-F]{24}/.test(req.url) && req.method === 'GET') {
    eventType = 'Order Details View'
  } else if (/\/cart\/[0-9a-fA-F]{24}/.test(req.url) && req.method === 'GET') {
    eventType = 'Visited Cart';
  } else if (req.path === '/cart') {
    eventType = 'Created Cart';
  } else if (/\/cart\/[0-9a-fA-F]{24}/.test(req.url) && req.method === 'PUT') {
    eventType = 'Updated Cart';
  } 
  return eventType;
}