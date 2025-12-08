import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateTaskAllocationPDF = (Allocated) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 🔹 Fetch data from localStorage
        const storedData = localStorage.getItem("client-storage");
        if (!storedData) {
            console.error("No client-storage found in localStorage");
            return;
        }

        const parsed = JSON.parse(storedData);
        const tasks = parsed.state.clients || [];

        // 🔹 Define color map
        const stageColors = {
            green: { label: "Completed", color: [0, 204, 0] },
            amber: { label: "In Progress", color: [204, 153, 0] },
            red: { label: "Pending", color: [255, 51, 51] },
        };

        // 🔹 Helper to format stage progress text
        const renderStageProgress = (stageArray) => {
            if (!Array.isArray(stageArray) || !stageArray.length) return "N/A";
            const stageObj = stageArray[0];
            const keys = ["S1", "S2", "S3", "S4"];
            return keys
                .map((key) => {
                    const color = stageObj[key];
                    const label = stageColors[color]?.label || "N/A";
                    return `${key}: ${label}`;
                })
                .join("\n");
        };

        // 🔹 Title
        doc.setFontSize(16);
        doc.text("Task Allocation Report - IDG Services", 14, 15);

        // 🔹 Headers
        const headers = [
            [
                "Order ID",
                "Client Name",
                "Billing Address",
                "Order Date",
                "Delivery Date",
                "Order Details",
                "Stage Progress",
                "Allocated User",
            ],
        ];

        // 🔹 Prepare rows from data
        const rows = tasks.map((task) => [
            task.orderId || "N/A",
            task.client_name || "N/A",
            task.billing_address || "N/A",
            task.order_date || "N/A",
            task.delivery_date || "N/A",
            task.orderDetails || "N/A",
            task.stages || [], // array of one object
            task.allocatedUser || "N/A",
        ]);

        // 🔹 Optional: filter by allocated user
        let finalRows = rows;
        if (Allocated && Allocated.trim() !== "") {
            finalRows = rows.filter((row) => row[7] === Allocated);
        }

        // 🔹 Table rendering
        autoTable(doc, {
            head: headers,
            body: finalRows.map((row) => [
                row[0],
                row[1],
                row[2],
                row[3],
                row[4],
                row[5],
                renderStageProgress(row[6]),
                row[7],
            ]),
            startY: 25,
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 2, minCellHeight: 10 },
            headStyles: {
                fillColor: [41, 128, 185], // 🔹 Header background color (blue tone)
                textColor: [255, 255, 255], // 🔹 Header text color (white)
                fontStyle: "bold",
                halign: "center",
                valign: "middle",
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245], // light gray rows for contrast
            },
        });


        // 🔹 Footer
        doc.setFontSize(10);
        doc.setTextColor(180, 180, 180);
        doc.text("Powered by OpsNav", pageWidth / 2, pageHeight - 10, {
            align: "center",
        });

        // 🔹 Save the PDF
        doc.save(`TAR - ${new Date().toLocaleDateString("en-GB")}.pdf`);
    } catch (err) {
        console.error("Error generating PDF:", err);
    }
};
