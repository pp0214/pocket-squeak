// PocketSqueakWidget.swift
// 将此文件内容复制到 Xcode 中的 Widget Extension

import WidgetKit
import SwiftUI

// MARK: - Data Models

struct WidgetPetData: Codable {
    let id: Int
    let name: String
    let species: String
    let latestWeight: Int?
    let weightChange: Double?
    let hasAlert: Bool
}

struct WidgetData: Codable {
    let updatedAt: String
    let pets: [WidgetPetData]
}

// MARK: - Data Provider

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> PetEntry {
        PetEntry(date: Date(), pets: [
            WidgetPetData(id: 1, name: "Squeaky", species: "rat", latestWeight: 350, weightChange: 2.5, hasAlert: false)
        ])
    }

    func getSnapshot(in context: Context, completion: @escaping (PetEntry) -> ()) {
        let entry = loadPetData()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let entry = loadPetData()
        
        // Refresh every 30 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        
        completion(timeline)
    }
    
    private func loadPetData() -> PetEntry {
        guard let containerURL = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: "group.com.pocketsqueak.shared"
        ) else {
            return PetEntry(date: Date(), pets: [])
        }
        
        let fileURL = containerURL.appendingPathComponent("widget_data.json")
        
        do {
            let data = try Data(contentsOf: fileURL)
            let widgetData = try JSONDecoder().decode(WidgetData.self, from: data)
            return PetEntry(date: Date(), pets: widgetData.pets)
        } catch {
            print("Failed to load widget data: \(error)")
            return PetEntry(date: Date(), pets: [])
        }
    }
}

// MARK: - Timeline Entry

struct PetEntry: TimelineEntry {
    let date: Date
    let pets: [WidgetPetData]
}

// MARK: - Widget Views

struct PetRowView: View {
    let pet: WidgetPetData
    
    var speciesEmoji: String {
        switch pet.species {
        case "rat": return "🐀"
        case "guinea_pig": return "🐹"
        case "hamster": return "🐹"
        case "gerbil": return "🐭"
        case "mouse": return "🐭"
        default: return "🐾"
        }
    }
    
    var weightChangeColor: Color {
        guard let change = pet.weightChange else { return .gray }
        if change <= -5 { return .red }
        if change >= 5 { return .green }
        return .gray
    }
    
    var body: some View {
        HStack(spacing: 8) {
            // Species emoji
            Text(speciesEmoji)
                .font(.title2)
            
            // Name
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text(pet.name)
                        .font(.headline)
                        .lineLimit(1)
                    
                    if pet.hasAlert {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }
                
                if let weight = pet.latestWeight {
                    Text("\(weight)g")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            // Weight change
            if let change = pet.weightChange {
                HStack(spacing: 2) {
                    Image(systemName: change > 0 ? "arrow.up" : change < 0 ? "arrow.down" : "minus")
                        .font(.caption2)
                    Text(String(format: "%.1f%%", abs(change)))
                        .font(.caption)
                }
                .foregroundColor(weightChangeColor)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(weightChangeColor.opacity(0.1))
                .cornerRadius(4)
            }
        }
    }
}

struct SmallWidgetView: View {
    let entry: PetEntry
    
    var body: some View {
        if let pet = entry.pets.first {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("🐹")
                        .font(.largeTitle)
                    
                    if pet.hasAlert {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.red)
                    }
                }
                
                Text(pet.name)
                    .font(.headline)
                    .lineLimit(1)
                
                if let weight = pet.latestWeight {
                    Text("\(weight)g")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.orange)
                }
                
                if let change = pet.weightChange {
                    HStack(spacing: 2) {
                        Image(systemName: change > 0 ? "arrow.up" : "arrow.down")
                            .font(.caption)
                        Text(String(format: "%.1f%%", abs(change)))
                            .font(.caption)
                    }
                    .foregroundColor(change <= -5 ? .red : change >= 5 ? .green : .gray)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .padding()
        } else {
            VStack {
                Image(systemName: "pawprint")
                    .font(.largeTitle)
                    .foregroundColor(.gray)
                Text("No pets")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

struct MediumWidgetView: View {
    let entry: PetEntry
    
    var body: some View {
        if entry.pets.isEmpty {
            VStack {
                Image(systemName: "pawprint")
                    .font(.largeTitle)
                    .foregroundColor(.gray)
                Text("No pets added yet")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Pocket Squeak")
                        .font(.headline)
                        .foregroundColor(.orange)
                    Spacer()
                    Text("🐹")
                }
                
                Divider()
                
                ForEach(entry.pets.prefix(3), id: \.id) { pet in
                    PetRowView(pet: pet)
                }
                
                if entry.pets.count > 3 {
                    Text("+\(entry.pets.count - 3) more")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
        }
    }
}

struct LargeWidgetView: View {
    let entry: PetEntry
    
    var body: some View {
        if entry.pets.isEmpty {
            VStack {
                Image(systemName: "pawprint")
                    .font(.system(size: 50))
                    .foregroundColor(.gray)
                Text("No pets added yet")
                    .font(.title3)
                    .foregroundColor(.secondary)
                Text("Open the app to add your first pet")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Pocket Squeak")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.orange)
                    Spacer()
                    Text("🐹")
                        .font(.title)
                }
                
                Divider()
                
                ForEach(entry.pets.prefix(6), id: \.id) { pet in
                    PetRowView(pet: pet)
                    if pet.id != entry.pets.prefix(6).last?.id {
                        Divider()
                    }
                }
                
                Spacer()
                
                if entry.pets.count > 6 {
                    Text("+\(entry.pets.count - 6) more pets")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, alignment: .center)
                }
            }
            .padding()
        }
    }
}

// MARK: - Main Widget View

struct PocketSqueakWidgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        default:
            MediumWidgetView(entry: entry)
        }
    }
}

// MARK: - Widget Configuration

@main
struct PocketSqueakWidget: Widget {
    let kind: String = "PocketSqueakWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            PocketSqueakWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Pet Health")
        .description("Track your pet's health at a glance")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Preview

#Preview(as: .systemMedium) {
    PocketSqueakWidget()
} timeline: {
    PetEntry(date: .now, pets: [
        WidgetPetData(id: 1, name: "Squeaky", species: "rat", latestWeight: 350, weightChange: 2.5, hasAlert: false),
        WidgetPetData(id: 2, name: "Whiskers", species: "hamster", latestWeight: 42, weightChange: -6.2, hasAlert: true),
    ])
}
