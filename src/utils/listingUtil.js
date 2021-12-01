import moment from 'moment';

export const getStatus = (endTime, highestBidder, address) => {
  // console.log({ highestBidder });
  const now = moment().unix();
  const end = moment(endTime).unix();

  if (end < now) {
    if (highestBidder === address) {
      return {
        label: 'You Won!',
        color: 'success',
      };
    }
    return {
      label: 'Completed',
      color: 'success',
    };
  }
  if (end - now < 86400) {
    return {
      label: 'Ending Soon',
      color: 'warning',
    };
  }
  return {
    label: 'Ongoing',
    color: 'secondary',
  };
};
