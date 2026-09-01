function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return "";
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!birthdayPassed) age -= 1;
  return age >= 0 ? age : "";
}

export default function PatientCard({ name, age: reportedAge, dateOfBirth, gender }) {
  const age = reportedAge || calculateAge(dateOfBirth);
  if (!name && !dateOfBirth && !gender) return null;

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-4 rounded-card border border-border bg-white p-4">
      {name && (
        <div>
          <p className="text-body-sm text-muted">Patient</p>
          <p className="text-body-lg text-ink font-medium">{name}</p>
        </div>
      )}
      {dateOfBirth && (
        <div>
          <p className="text-body-sm text-muted">Date of Birth</p>
          <p className="text-body-lg text-ink font-medium">{dateOfBirth}</p>
        </div>
      )}
      {age !== "" && (
        <div>
          <p className="text-body-sm text-muted">Age</p>
          <p className="text-body-lg text-ink font-medium">{age}</p>
        </div>
      )}
      {gender && (
        <div>
          <p className="text-body-sm text-muted">Gender</p>
          <p className="text-body-lg text-ink font-medium">{gender}</p>
        </div>
      )}
    </div>
  );
}
