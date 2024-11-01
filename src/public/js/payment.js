document.addEventListener('DOMContentLoaded', function () {

  var subsBoxs = document.querySelectorAll('.subsBox');
  var productsBoxs = document.querySelectorAll('.productsBox');
  var cancelButton = document.getElementById('cancel-subs');


  cancelButton.addEventListener('click', function () {
    console.log('Cancel Subscription clicked');


    if (userSubs.length > 0) {

      // Swal modalını aç
      Swal.fire({
        title: 'Are you sure?',
        html: '<span style="font-size: 18px; color: #ffffff;">Do you want to cancel your subscription?</span>',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        customClass: {
          popup: 'swal2-dark-popup'
        },
        preConfirm: () => {

        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await fetch('/delete-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
              })
              .then(data => {
                Swal.fire({
                  title: 'Success',
                  text: 'Subscription cancellation successful!',
                  icon: 'success',
                  customClass: {
                  }
                }).then(() => {
                  location.reload();
                }
                );
              })
              .catch((error) => {
                console.error('Error:', error);
              });

          } catch (error) {
            console.error('Error:', error);
          }

          // For example, you can make an API call here
          // alert('Subscription canceled.');



        } else {
          console.log('Cancellation was aborted.');
        }
      });
    }


  });

  subsBoxs.forEach(subsBox => {
    subsBox.addEventListener('click', async function () {
      const priceId = this.dataset.planId;
      console.log(`Plan ID: ${priceId}`);

      try {
        // Send product ID to the server to create a payment intent or session
        const response = await fetch('/api/stripe/create-subscription-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ priceId }),
        });

        const session = await response.json();

        // Redirect to Stripe Checkout  
        const result = await stripe.redirectToCheckout({
          sessionId: session.id,
        });

        if (result.error) {
          alert(result.error.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  });

  productsBoxs.forEach(productsBox => {
    productsBox.addEventListener('click', async function () {
      const priceId = this.dataset.planId;
      console.log(`Plan ID: ${priceId}`);

      try {
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ priceId }),
        });

        const session = await response.json();

        const result = await stripe.redirectToCheckout({
          sessionId: session.id,
        });

        if (result.error) {
          alert(result.error.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  });
});

