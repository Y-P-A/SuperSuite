/* Loan Calculator — standard amortising payment, plus the full schedule. */
(function () {
  const principal = document.getElementById('principal');
  const rate = document.getElementById('rate');
  const years = document.getElementById('years');

  function money(value) {
    return value.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function render() {
    const amount = Math.max(0, Number(principal.value) || 0);
    const annual = Math.max(0, Number(rate.value) || 0);
    const termYears = Math.max(1, Math.min(40, Number(years.value) || 1));
    const payments = Math.round(termYears * 12);
    const monthlyRate = annual / 100 / 12;

    const monthly = monthlyRate === 0
      ? amount / payments
      : (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -payments));

    const totalPaid = monthly * payments;
    const totalInterest = totalPaid - amount;

    document.getElementById('monthly').textContent = money(monthly);
    document.getElementById('interest').textContent = money(totalInterest);
    document.getElementById('total').textContent = money(totalPaid);
    document.getElementById('count').textContent = String(payments);
    document.getElementById('note').textContent = payments + ' monthly payments';

    if (!Number.isFinite(monthly) || payments > 480) {
      document.getElementById('schedule').innerHTML = '<tr><td>Enter sensible numbers to see the schedule.</td></tr>';
      return;
    }

    let balance = amount;
    let rows = '<thead><tr><th>#</th><th>Payment</th><th>Interest</th><th>Principal</th><th>Balance</th></tr></thead><tbody>';
    for (let month = 1; month <= payments; month++) {
      const interest = balance * monthlyRate;
      let principalPart = monthly - interest;
      if (principalPart > balance) principalPart = balance;
      balance -= principalPart;
      if (month <= 360) {
        rows += '<tr><td>' + month + '</td><td>' + money(monthly) + '</td><td>' + money(interest) +
          '</td><td>' + money(principalPart) + '</td><td>' + money(Math.max(0, balance)) + '</td></tr>';
      }
      if (balance <= 0.005) break;
    }
    rows += '</tbody>';
    document.getElementById('schedule').innerHTML = rows;
  }

  [principal, rate, years].forEach(function (el) { el.addEventListener('input', render); });
  render();
})();
