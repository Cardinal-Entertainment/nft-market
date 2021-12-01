const logger = (action) => {
  if (window.debug && process.env.NODE_ENV === 'development') {
    console.log('Dispatching Action: ', action);
  }
};

export default logger;
