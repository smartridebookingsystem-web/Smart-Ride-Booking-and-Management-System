import React from "react";
import {
  Car,
  Wallet,
  Bell,
  Star,
  Clock,
  MapPin,
} from "lucide-react";

function DriverDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-5">
        <h1 className="text-3xl font-bold text-orange-500 mb-8">
          DriveCab
        </h1>

        <ul className="space-y-4">
          <li className="bg-orange-500 text-white p-3 rounded-lg">
            Dashboard
          </li>
          <li className="p-3 hover:bg-orange-100 rounded-lg cursor-pointer">
            Ride Requests
          </li>
          <li className="p-3 hover:bg-orange-100 rounded-lg cursor-pointer">
            Earnings
          </li>
          <li className="p-3 hover:bg-orange-100 rounded-lg cursor-pointer">
            Ride History
          </li>
          <li className="p-3 hover:bg-orange-100 rounded-lg cursor-pointer">
            Ratings
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-bold mb-6">
          Driver Dashboard
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card
            title="Today's Earnings"
            value="₹1,250"
            icon={<Wallet />}
          />
          <Card
            title="Completed Rides"
            value="8"
            icon={<Car />}
          />
          <Card
            title="Distance Covered"
            value="72 km"
            icon={<MapPin />}
          />
          <Card
            title="Working Hours"
            value="6h 30m"
            icon={<Clock />}
          />
        </div>

        {/* Ride Requests */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4">
            Ride Requests
          </h3>

          <div className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <h4 className="font-bold">
                Rahul Sharma
              </h4>
              <p>Railway Station → Airport</p>
              <p className="text-gray-500">
                Distance: 12 km
              </p>
            </div>

            <div>
              <p className="text-xl font-bold text-orange-500">
                ₹350
              </p>
            </div>

            <div className="space-x-2">
              <button className="border border-orange-500 text-orange-500 px-4 py-2 rounded">
                Reject
              </button>

              <button className="bg-orange-500 text-white px-4 py-2 rounded">
                Accept
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Wallet */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-4">
              Wallet
            </h3>

            <p className="text-4xl font-bold text-orange-500">
              ₹2,450
            </p>

            <button className="mt-4 bg-orange-500 text-white px-5 py-2 rounded-lg">
              Withdraw
            </button>
          </div>

          {/* Performance */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-4">
              Performance
            </h3>

            <div className="space-y-3">
              <p>Acceptance Rate: 95%</p>
              <p>Cancellation Rate: 2%</p>
              <p>Completion Rate: 98%</p>
            </div>
          </div>
        </div>

        {/* Ride History */}
        <div className="bg-white p-6 rounded-xl shadow mt-8">
          <h3 className="text-xl font-semibold mb-4">
            Ride History
          </h3>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3">Passenger</th>
                <th className="p-3">Pickup</th>
                <th className="p-3">Drop</th>
                <th className="p-3">Fare</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b">
                <td className="p-3">Rahul Sharma</td>
                <td className="p-3">Station</td>
                <td className="p-3">Airport</td>
                <td className="p-3">₹350</td>
              </tr>

              <tr>
                <td className="p-3">Priya Patil</td>
                <td className="p-3">Bus Stand</td>
                <td className="p-3">City Mall</td>
                <td className="p-3">₹220</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
      <div>
        <p className="text-gray-500">{title}</p>
        <h3 className="text-3xl font-bold mt-2">
          {value}
        </h3>
      </div>

      <div className="bg-orange-100 p-3 rounded-full text-orange-500">
        {icon}
      </div>
    </div>
  );
}

export default DriverDashboard;