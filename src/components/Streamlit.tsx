// src/components/Streamlit.tsx
import React, { useState, useEffect } from "react";

interface Proposal {
  company_analysis: Record<string, string>;
  use_cases: Array<{
    title: string;
    description: string;
    benefits: string;
    complexity: string;
    roi_impact: string;
    technologies: string;
  }>;
  resources: Record<string, Record<string, string[]>>;
}

interface StreamlitProps {
  companyName: string;
}

const Streamlit = ({ companyName }: StreamlitProps) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState<"company" | "usecases" | "resources">("company");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const downloadFile = (data: string, fileName: string, type: string) => {
    const fileData = new Blob([data], { type });
    const url = URL.createObjectURL(fileData);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  };

  const handleGenerate = async (company: string) => {
    setError("");
    setLoading(true);
    
    try {
      const response = await fetch("https://flask-server-q89r.onrender.com/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: company }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error generating proposal");
      }

      const data: Proposal = await response.json();
      setProposal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error connecting to the server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyName.trim()) {
      handleGenerate(companyName);
    } else {
      setProposal(null);
      setError("");
    }
  }, [companyName]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-primary text-center">
        AI Use Case Generator
      </h1>
      <p className="text-center text-gray-600 mt-2">
        Analyzing AI/ML opportunities for: {companyName || "..."}
      </p>

      {loading && (
        <div className="text-center mt-4 text-primary">
          Generating proposal...
        </div>
      )}

      {error && <p className="text-red-500 text-center mt-3">{error}</p>}

      {proposal && (
        <div className="mt-8">
          <div className="flex justify-center space-x-4 border-b pb-2">
            {(["company", "usecases", "resources"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold ${
                  activeTab === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-600 hover:text-primary"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === "company" && (
              <div>
                <h2 className="text-xl font-semibold text-primary mb-4">
                  Company Analysis
                </h2>
                {Object.entries(proposal.company_analysis).map(([key, value]) => (
                  <div key={key} className="bg-gray-100 p-4 rounded-lg mt-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {key.replace("_", " ").toUpperCase()}
                    </h3>
                    <p className="text-gray-600">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "usecases" && (
              <div>
                <h2 className="text-xl font-semibold text-primary mb-4">
                  AI/ML Use Cases
                </h2>
                {proposal.use_cases.map((useCase, index) => (
                  <div key={index} className="bg-gray-100 p-4 rounded-lg mt-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {useCase.title}
                    </h3>
                    <p><strong>Description:</strong> {useCase.description}</p>
                    <p><strong>Benefits:</strong> {useCase.benefits}</p>
                    <p><strong>Complexity:</strong> {useCase.complexity}</p>
                    <p><strong>ROI Impact:</strong> {useCase.roi_impact}</p>
                    <p><strong>Technologies:</strong> {useCase.technologies}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "resources" && (
              <div>
                <h2 className="text-xl font-semibold text-primary mb-4">
                  Implementation Resources
                </h2>
                {Object.entries(proposal.resources).map(([useCaseTitle, resources]) => (
                  <div key={useCaseTitle} className="bg-gray-100 p-4 rounded-lg mt-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {useCaseTitle}
                    </h3>
                    {Object.entries(resources).map(([category, links]) => (
                      <div key={category} className="mt-2">
                        <h4 className="font-semibold">
                          {category.replace(/_/g, ' ').toUpperCase()}
                        </h4>
                        <ul className="list-disc ml-4">
                          {links.map((link, i) => (
                            <li key={i}>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                              >
                                {link}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => downloadFile(
                JSON.stringify(proposal, null, 2),
                `${companyName}_proposal.json`,
                "application/json"
              )}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Download JSON
            </button>
            <button
              onClick={() => downloadFile(
                `# AI Use Cases Report for ${companyName}\n\n${JSON.stringify(proposal, null, 2)}`,
                `${companyName}_proposal.md`,
                "text/markdown"
              )}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Download Markdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Streamlit;