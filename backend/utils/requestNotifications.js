const User = require("../models/User");
const { sendEmail, escapeHtml } = require("./emailService");

const configFor = (type) => type === "emergency"
  ? { label: "Emergency", prefix: "RC-EMG", noun: "emergency request" }
  : { label: "Assistance", prefix: "RC-AST", noun: "assistance request" };

function requestNumberFor(type, request) {
  const config = configFor(type);
  return request.requestNumber || `${config.prefix}-${String(request._id || "").slice(-8).toUpperCase()}`;
}

async function resolveRequester(request) {
  if (request?.user && typeof request.user === "object" && request.user.email) return request.user;
  const id = request?.user?._id || request?.user;
  if (!id) return null;
  return User.findById(id).select("fullName email role").lean();
}

async function sendRegistrationEmail(user) {
  if (!user?.email) return false;
  const name = user.fullName || "there";
  const text = `Hello ${name},\n\nYour ReliefConnect account has been created successfully.\n\nAccount role: ${user.role || "User"}\n\nThank you for joining ReliefConnect.`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#17243b"><h2>Welcome to ReliefConnect, ${escapeHtml(name)}!</h2><p>Your account has been created successfully.</p><p><strong>Account role:</strong> ${escapeHtml(user.role || "User")}</p><p>Thank you for joining ReliefConnect.</p></div>`;
  return sendEmail({ to: user.email, subject: "Welcome to ReliefConnect — Registration Successful", text, html });
}

async function sendLoginEmail(user) {
  if (!user?.email) return false;
  const name = user.fullName || "there";
  const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  const text = `Hello ${name},\n\nA successful login to your ReliefConnect account was recorded at ${time} IST. If this was not you, please change your password and contact your administrator.\n\nReliefConnect`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#17243b"><h2>Successful login notification</h2><p>Hello ${escapeHtml(name)},</p><p>A successful login to your ReliefConnect account was recorded.</p><p><strong>Time:</strong> ${escapeHtml(time)} IST</p><p>If this was not you, change your password and contact your administrator.</p><p>ReliefConnect</p></div>`;
  return sendEmail({ to: user.email, subject: "Successful login to your ReliefConnect account", text, html });
}

async function sendRequestCreatedEmail(type, request) {
  const requester = await resolveRequester(request);
  if (!requester?.email) return false;
  const config = configFor(type);
  const number = requestNumberFor(type, request);
  const detailType = type === "emergency" ? request.emergencyType : request.assistanceType;
  const status = request.status || "Pending";
  const location = request.location || "Not specified";
  const created = new Date(request.createdAt || Date.now()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  const subject = `${config.label} Request Registered — ${number}`;
  const text = `Hello ${requester.fullName || "Citizen"},\n\nYour ${config.noun} has been successfully submitted to ReliefConnect.\n\nRequest number: ${number}\nType: ${detailType || config.label}\nLocation: ${location}\nStatus: ${status}\nSubmitted: ${created} IST\n\nKeep this request number for reference. We will email you when the status changes.\n\nReliefConnect Disaster Relief Coordination Team`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#17243b"><h2>Your ${config.label.toLowerCase()} request was registered successfully</h2><p>Hello ${escapeHtml(requester.fullName || "Citizen")},</p><p>Your ${config.noun} has been successfully submitted to ReliefConnect.</p><div style="background:#f1f5f9;border-radius:10px;padding:18px"><p style="margin:0;color:#64748b">Your request number</p><h1 style="color:#ea580c;margin:8px 0">${escapeHtml(number)}</h1><p><strong>Type:</strong> ${escapeHtml(detailType || config.label)}</p><p><strong>Location:</strong> ${escapeHtml(location)}</p><p><strong>Status:</strong> ${escapeHtml(status)}</p><p><strong>Submitted:</strong> ${escapeHtml(created)} IST</p></div><p>Please keep your request number for reference. We will email you when the request status changes.</p><p>ReliefConnect Disaster Relief Coordination Team</p></div>`;
  return sendEmail({ to: requester.email, subject, text, html });
}

async function sendRequestStatusEmail(type, request, previousStatus, newStatus, actionBy = "ReliefConnect response team") {
  if (!request || (previousStatus && previousStatus === newStatus)) return false;
  const requester = await resolveRequester(request);
  if (!requester?.email) return false;
  const config = configFor(type);
  const number = requestNumberFor(type, request);
  const detailType = type === "emergency" ? request.emergencyType : request.assistanceType;
  const subject = `${config.label} Request Update — ${number}: ${newStatus}`;
  const text = `Hello ${requester.fullName || "Citizen"},\n\nThere is an update to your ${config.noun}.\n\nRequest number: ${number}\nType: ${detailType || config.label}\nPrevious status: ${previousStatus || "Previously recorded"}\nNew status: ${newStatus}\nUpdated by: ${actionBy}\nUpdated: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST\n\nPlease sign in to ReliefConnect to view the latest details.\n\nReliefConnect Disaster Relief Coordination Team`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#17243b"><h2>Your ${config.label.toLowerCase()} request has been updated</h2><p>Hello ${escapeHtml(requester.fullName || "Citizen")},</p><p>There is a status update to your ${config.noun}.</p><div style="background:#f1f5f9;border-radius:10px;padding:18px"><p style="margin:0;color:#64748b">Request number</p><h2 style="color:#ea580c">${escapeHtml(number)}</h2><p><strong>Type:</strong> ${escapeHtml(detailType || config.label)}</p><p><strong>Previous status:</strong> ${escapeHtml(previousStatus || "Previously recorded")}</p><p><strong>New status:</strong> ${escapeHtml(newStatus)}</p><p><strong>Updated by:</strong> ${escapeHtml(actionBy)}</p></div><p>Sign in to ReliefConnect to view the latest details.</p><p>ReliefConnect Disaster Relief Coordination Team</p></div>`;
  return sendEmail({ to: requester.email, subject, text, html });
}

async function sendAssignmentEmail(type, request, assignee, assignedBy = "Government") {
  if (!request || !assignee?.email) return false;

  const config = configFor(type);
  const number = requestNumberFor(type, request);
  const detailType =
    type === "emergency" ? request.emergencyType : request.assistanceType;
  const location =
    typeof request.location === "string"
      ? request.location
      : request.location?.address || "Not specified";
  const status = request.status || "Acknowledged";
  const role = assignee.role || "Responder";
  const name = assignee.fullName || role;

  const subject = `New ${config.label} Task Assigned — ${number}`;

  const text = `Hello ${name},

A new ${config.noun} has been assigned to you through ReliefConnect.

Request number: ${number}
Type: ${detailType || config.label}
Location: ${location}
Current status: ${status}
Assigned by: ${assignedBy}

Please sign in to ReliefConnect to review the request and take the necessary action.

ReliefConnect Disaster Relief Coordination Team`;

  const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#17243b">
    <h2>New task assigned to you</h2>
    <p>Hello ${escapeHtml(name)},</p>
    <p>A new ${escapeHtml(config.noun)} has been assigned to you through ReliefConnect.</p>
    <div style="background:#f1f5f9;border-radius:10px;padding:18px">
      <p><strong>Request number:</strong> ${escapeHtml(number)}</p>
      <p><strong>Type:</strong> ${escapeHtml(detailType || config.label)}</p>
      <p><strong>Location:</strong> ${escapeHtml(location)}</p>
      <p><strong>Current status:</strong> ${escapeHtml(status)}</p>
      <p><strong>Assigned by:</strong> ${escapeHtml(assignedBy)}</p>
    </div>
    <p>Please sign in to ReliefConnect to review the request and take the necessary action.</p>
    <p>ReliefConnect Disaster Relief Coordination Team</p>
  </div>`;

  return sendEmail({
    to: assignee.email,
    subject,
    text,
    html,
  });
}

module.exports = {
  sendRegistrationEmail,
  sendLoginEmail,
  sendRequestCreatedEmail,
  sendRequestStatusEmail,
  sendAssignmentEmail,
};
