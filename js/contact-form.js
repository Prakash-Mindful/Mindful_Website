function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  const status = document.querySelector('[data-form-status]');
  if (!form || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    status.textContent = "Thanks — we'll be in touch within one business day.";
    status.classList.add('is-visible');
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', initContactForm);
