import streamlit as st
import pandas as pd
import folium
from streamlit_folium import st_folium
import random

# Sample Data (Static for Simplicity)
fire_zones = pd.DataFrame({
    'latitude': [37.7749, 38.7749],
    'longitude': [-122.4194, -123.4194],
    'risk': ['High', 'Medium']
})

# Simulate Drone Alerts
def simulate_drone_alert():
    return {
        "latitude": random.uniform(37, 39),
        "longitude": random.uniform(-123, -121),
        "alert": "Fire detected"
    }

# Streamlit Dashboard
st.title("Fire Detection Platform")
st.write("Monitoring high-risk fire areas and drone alerts.")

# Map for Fire Zones
m = folium.Map(location=[37.5, -122], zoom_start=7)
for _, row in fire_zones.iterrows():
    folium.Marker([row['latitude'], row['longitude']], popup=f"Risk: {row['risk']}").add_to(m)

# Simulate Drone Alerts
if st.button("Simulate Drone Alert"):
    alert = simulate_drone_alert()
    folium.Marker(
        [alert['latitude'], alert['longitude']],
        popup=alert['alert'],
        icon=folium.Icon(color="red")
    ).add_to(m)

# Display Map
st_folium(m, width=700, height=500)
