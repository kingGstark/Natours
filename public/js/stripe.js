import axios from 'axios';

export const bookTour = async (tourId) => {
  //get session

  try {
    const stripe = Stripe(
      'pk_test_51IKR1TI6EqHGiI1ossxNbl3JsvYZZFfJMzwjQXG9rxLi0tfnum1oA4lKgHOh5JpyDUuMhdrQXv9l383h285oKxwv00laF0fup3'
    );

    const session = await axios(
      `http://localhost:3000/api/v1/booking/checkout-session/${tourId}`
    );

    //create checkout form + proccess

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
  }
};