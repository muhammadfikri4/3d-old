import React from "react";
import { Link } from "react-router-dom";
import { FilterMenus } from "../types/FilterMenus";
import { Icon } from "../assets/icon/Icon";

const Selection: FilterMenus[] = [
  {
    name: "Lantai 2",
    className: "select-floor",
    to: "#",
    tabIndex: 2,
  },
  {
    name: "Lantai 1",
    className: "select-floor",
    to: "#",
    tabIndex: 1,
  },
  {
    name: "Lantai GF",
    className: "select-floor",
    to: "#",
    tabIndex: 0,
  },
];

const FilterSection = () => {
  return (
    <div className="box">
      <h1>Select Floor</h1>
      <ul className="list-floor">
        {Selection.map((item, index) => (
          <li key={index} style={{ listStyle: "none" }}>
            <Link
              className={item.className}
              tabIndex={item.tabIndex}
              to={item.to}
              style={{
                textDecoration: "none",
              }}
            >
              <div className="button-floor">
                <Icon />
                <p style={{ color: "white", fontWeight: "bold" }}>
                  {item.name}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FilterSection;
