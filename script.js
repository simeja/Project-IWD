const state = {
  role: 'student',
  appointments: [
    {
      id: 1,
      studentId: 'STU-2048',
      name: 'Elizabeth Goma',
      department: 'Computer Science',
      doctor: 'Dr. Moyo',
      date: '2026-09-15',
      time: '09:00 AM',
      concern: 'General consultation',
      notes: 'Mild dizziness after class.',
      status: 'Pending'
    },
    {
      id: 2,
      studentId: 'STU-1097',
      name: 'Sophie Simeja',
      department: 'Business',
      doctor: 'Dr. Banda',
      date: '2026-09-15',
      time: '10:30 AM',
      concern: 'Stress and wellness',
      notes: 'Anxious before exams.',
      status: 'Checked in'
    },
    {
      id: 3,
      studentId: 'STU-3312',
      name: 'Joshua Chirwa',
      department: 'Health Sciences',
      doctor: 'Dr. Sinkala',
      date: '2026-09-16',
      time: '02:00 PM',
      concern: 'Vaccination follow-up',
      notes: 'Review of booster records.',
      status: 'Completed'
    }
  ],
  nextId: 4
};

function switchRole(role) {
  state.role = role;

  document.querySelectorAll('.role-btn').forEach((button) => {
    const isActive = button.dataset.role === role;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  document.querySelectorAll('.view-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `${role}-view`);
  });
}

function showNotification(message, type = 'success') {
  const banner = document.getElementById('notification-banner');
  if (!banner) return;

  banner.textContent = message;
  banner.className = `notification ${type} show`;

  window.clearTimeout(showNotification.timeoutId);
  showNotification.timeoutId = window.setTimeout(() => {
    banner.classList.remove('show');
  }, 3200);
}

function updateSummaryCards() {
  const total = state.appointments.length;
  const pending = state.appointments.filter((item) => item.status === 'Pending').length;
  const completed = state.appointments.filter((item) => item.status === 'Completed').length;

  const totalBookings = document.getElementById('total-bookings');
  const pendingBookings = document.getElementById('pending-bookings');
  const completedBookings = document.getElementById('completed-bookings');

  if (totalBookings) totalBookings.textContent = total;
  if (pendingBookings) pendingBookings.textContent = pending;
  if (completedBookings) completedBookings.textContent = completed;
}

function renderAppointments() {
  const appointmentList = document.getElementById('appointment-list');
  if (!appointmentList) return;

  appointmentList.innerHTML = state.appointments
    .map((entry) => {
      const badgeClass = entry.status.toLowerCase().replace(/\s+/g, '-');
      return `
        <article class="appointment-card">
          <div class="appointment-top">
            <div>
              <h3>${entry.name}</h3>
              <p>${entry.studentId} • ${entry.department}</p>
            </div>
            <span class="status-badge ${badgeClass}">${entry.status}</span>
          </div>
          <div class="appointment-meta">
            <span>${entry.doctor}</span>
            <span>${entry.date}</span>
            <span>${entry.time}</span>
          </div>
          <p class="concern">${entry.concern}</p>
          <p class="notes">${entry.notes || 'No extra notes provided.'}</p>
          <div class="action-row">
            <button type="button" class="status-button" data-id="${entry.id}" data-status="Checked in">Check in</button>
            <button type="button" class="status-button secondary" data-id="${entry.id}" data-status="Completed">Complete</button>
          </div>
        </article>
      `;
    })
    .join('');

  updateSummaryCards();

  const doctorQueue = document.getElementById('doctor-queue');
  if (!doctorQueue) return;

  const activeQueue = state.appointments.filter((entry) => entry.status !== 'Completed');
  doctorQueue.innerHTML = activeQueue
    .map(
      (entry) => `
        <article class="queue-card">
          <div>
            <p class="queue-label">${entry.doctor}</p>
            <h3>${entry.name}</h3>
          </div>
          <div class="queue-details">
            <span>${entry.concern}</span>
            <span>${entry.date} • ${entry.time}</span>
          </div>
          <p>${entry.notes}</p>
        </article>
      `
    )
    .join('') || '<p class="empty-state">No patients waiting for review.</p>';
}

function handleBooking(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const appointment = {
    id: state.nextId++,
    studentId: String(formData.get('studentId') || '').trim(),
    name: String(formData.get('studentName') || '').trim(),
    department: String(formData.get('department') || '').trim(),
    doctor: String(formData.get('doctor') || '').trim(),
    date: String(formData.get('date') || '').trim(),
    time: String(formData.get('time') || '').trim(),
    concern: String(formData.get('concern') || '').trim(),
    notes: String(formData.get('notes') || '').trim(),
    status: 'Pending'
  };

  if (!appointment.studentId || !appointment.name || !appointment.date || !appointment.time) {
    showNotification('Please complete all required appointment fields.', 'error');
    return;
  }

  state.appointments.unshift(appointment);
  form.reset();
  renderAppointments();
  switchRole('student');
  showNotification(`Appointment booked for ${appointment.name} with ${appointment.doctor}.`, 'success');
}

function updateAppointmentStatus(id, status) {
  state.appointments = state.appointments.map((entry) => {
    if (entry.id === Number(id)) {
      return { ...entry, status };
    }
    return entry;
  });

  renderAppointments();
  showNotification(`Appointment marked as ${status}.`, 'info');
}

function setupEventListeners() {
  document.querySelectorAll('.role-btn').forEach((button) => {
    button.addEventListener('click', () => switchRole(button.dataset.role));
  });

  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBooking);
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-status]');
    if (!button) return;

    updateAppointmentStatus(button.dataset.id, button.dataset.status);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderAppointments();
  setupEventListeners();
  switchRole('student');
});
