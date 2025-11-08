import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { FocusComponent } from './pages/focus/focus.component';
import { SequenceComponent } from './pages/sequence/sequence.component';
import { NavigatorComponent } from './pages/navigator/navigator.component';
import { GuiderComponent } from './pages/guider/guider.component';
import { AllskyComponent } from './pages/allsky/allsky.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { PlannerComponent } from './pages/planner/planner.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'focus', component: FocusComponent },
  { path: 'sequence', component: SequenceComponent },
  { path: 'navigator', component: NavigatorComponent },
  { path: 'guider', component: GuiderComponent },
  { path: 'allsky', component: AllskyComponent },
  { path: 'messages', component: MessagesComponent },
  { path: 'planner', component: PlannerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
