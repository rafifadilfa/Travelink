<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\Tour;
use App\Models\Category;
use App\Models\DayPhase;
use App\Models\MeetingPoint;
use App\Models\Location;
use App\Models\Tag;
use App\Models\Item;
use App\Models\TourImage;
use Illuminate\Support\Facades\Storage;

class EditTourController extends Controller
{
    public function show_edit_tour(Tour $tour){

        $tour->load(['images', 'tags', 'location', 'categories', 'itineraries', 'items', 'meetingPoint', 'dayphase'])->withTrashed();
        $categories = Category::all();
        $dayphases = DayPhase::all();
        $meetingpoints = MeetingPoint::all();
        $locations = Location::all();
        $tags = Tag::all();
        $items = Item::all();

        return Inertia::render('EditTour', [
            'tour' => $tour,
            'categories' => $categories,
            'dayphases' => $dayphases,
            'meetingpoints' => $meetingpoints,
            'locations' => $locations,
            'tags' => $tags,
            'items' => $items,
        ]);
    }

    public function update_tour_details(Request $request){
        $validated = $request->validate([
            'id' => 'required|integer',
            'name' => 'required|string',
            'tour_location_id' => 'required|integer',
            'tour_meeting_point_id' => 'required|integer',
            'tour_description' => 'required|string',
            'tour_guide_id' => 'required|integer',
            'tour_price' => 'required|integer|min:10000',
            'tour_duration' => 'required|integer|min:2',
            'tour_start_time' => 'required|string',
            'tour_period_id' => 'required|integer',
            'tour_max_participants' => 'required|integer|max:10',
            'tour_min_participants' => 'required|integer|min:1',
            'featured' => 'required|boolean',

            'tour_categories' => 'required|array',
            'tour_categories.*' => 'integer|exists:categories,id',

            'tour_tags' => 'required|array',
            'tour_tags.*' => 'integer|exists:tags,id',

            'tour_items' => 'required|array',
            'tour_items.*' => 'integer|exists:items,id',

            'tour_itineraries' => 'array',
            'tour_itineraries.*.id' => 'nullable|integer|exists:tour_itineraries,id',
            'tour_itineraries.*.step_number' => 'required|integer',
            'tour_itineraries.*.start_time' => 'required|string',
            'tour_itineraries.*.activity' => 'required|string',
            'tour_itineraries.*.description' => 'required|string',

            'tour_images' => 'array',
            'tour_images.*' => 'file|mimes:jpg,jpeg,png|max:2048',

            'existing_image_ids' => 'array',
            'existing_image_ids.*' => 'integer|exists:tour_images,id',
        ]);

        $guide = Auth::guard('guides')->User();
        $tour = Tour::findOrFail($validated['id']);
        
        if($guide->id !== $tour->id){

            abort(403, 'Unauthorized');
        }

        // Update the tour info and BelongsTo
        $tour->update([
            'name' => $validated['name'],
            'tour_location_id' => $validated['tour_location_id'],
            'tour_meeting_point_id' => $validated['tour_meeting_point_id'],
            'tour_description' => $validated['tour_description'],
            'tour_price' => $validated['tour_price'],
            'tour_duration' => $validated['tour_duration'],
            'tour_start_time' => $validated['tour_start_time'],
            'tour_period_id' => $validated['tour_period_id'],
            'tour_max_participants' => $validated['tour_max_participants'],
            'tour_min_participants' => $validated['tour_min_participants'],
            'featured' => $validated['featured'],
        ]);

        // Many to Many
        $tour->categories()->sync($validated['tour_categories']);
        $tour->items()->sync($validated['tour_items']);
        $tour->tags()->sync($validated['tour_tags']);

        if ($request->hasFile('tour_images')) {
            
            // Delete Existing Image is requested
            $keptImageIds = $validated['existing_image_ids'];
            $imagesToDelete = $tour->images()->whereNotIn('id', $keptImageIds)->get();
                foreach ($imagesToDelete as $image) {
                    Storage::disk('public')->delete($image->image_path); // Delete file from storage
                    $image->delete();
            }

            // Add new images
            $image_order = sizeof($keptImageIds)+1;
            $image_caption = Location::findOrFail($validated['tour_location_id']);

            foreach ($request->file('tour_images') as $image) {
                $path = $image->store('tour_images', 'public');
                $tour->images()->create([
                    'image_path' => $path,
                    'image_order' => $image_order,
                    'image_caption' => $image_caption->name . '_' . $image_order,
                ]);
                $image_order += 1;
            }
        }

        if(!empty($validated['tour_itineraries'])){
            $incomingItineraryIds = [];
            foreach ($validated['tour_itineraries'] as $index => $itineraryData) {
                $itinerary = $tour->itineraries()->updateOrCreate(
                    ['id' => $itineraryData['id'] ?? 0], // Find by existing ID or prepare to create
                    [
                        'step_number' => $index + 1,
                        'start_time' => $itineraryData['start_time'],
                        'activity' => $itineraryData['activity'],
                        'description' => $itineraryData['description'],
                    ]
                );
                $incomingItineraryIds[] = $itinerary->id;
            }
            // Delete any itineraries that were removed on the frontend
            $tour->itineraries()->whereNotIn('id', $incomingItineraryIds)->delete();            
        }


        return redirect()->route('guide.tours.show')->with('success', 'Tour Successfully updated');
    }
}
