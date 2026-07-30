import "./Statistics.css";

function Statistics() {
  const stats = [
    { number: "150+", title: "Disaster Responses" },
    { number: "5000+", title: "Registered Volunteers" },
    { number: "350+", title: "Relief Camps" },
    { number: "25000+", title: "Families Assisted" },
  ];

  return (
    <section className="statistics">
      <div className="stats-container">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <h2>{item.number}</h2>
            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Statistics;