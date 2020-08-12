/* eslint-disable no-unused-vars */
module.exports.goodbye = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Bye',
    }),
  };
};
