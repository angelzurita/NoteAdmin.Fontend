import { Component, ChangeDetectionStrategy, inject, OnInit, ViewChild, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { QuillModule, QuillEditorComponent } from 'ngx-quill';

import { NotesFacade } from '../../services/notes-facade.service';
import { CategoriesFacade } from '../../../categories/services/categories-facade.service';

@Component({
  selector: 'app-notes-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, QuillModule],
  templateUrl: './notes-create.html',
  styleUrl: './notes-create.css',
})
export class NotesCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(NotesFacade);
  private readonly categoriesFacade = inject(CategoriesFacade);
  private readonly router = inject(Router);

  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly categories = this.categoriesFacade.categories;

  @ViewChild(QuillEditorComponent) quillEditorRef!: QuillEditorComponent;

  readonly showEmojiPicker = signal(false);
  readonly selectedEmojiCategory = signal(0);

  readonly emojiCategories = [
    { icon: '😀', label: 'Smileys', emojis: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😗','😙','😋','😛','😝','😜','🤪','🤓','😎','🥳','😏','😒','😞','😔','😟','😕','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','😵','🤧','😷','🤒','🤕'] },
    { icon: '👋', label: 'Gestos', emojis: ['👍','👎','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👋','🤚','🖐','✋','🖖','👏','🙌','🤲','🤝','🙏','✍️','💪','👂','👃','👁','👀','🫶','💅','🤳'] },
    { icon: '🐶', label: 'Naturaleza', emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🌸','🌹','🌺','🌻','🌼','🌷','🍀','🌿','🌱','🌲','🌳','🌴','🍁','🍂','🍃','🌾','🌊','🌈','☀️','🌙','⭐','🌟','☁️','⛅','🌧','❄️','🔥','💧','🌍','🌕'] },
    { icon: '🍔', label: 'Comida', emojis: ['🍎','🍊','🍋','🍇','🍓','🍒','🍑','🥭','🍍','🥥','🍔','🍟','🌮','🌯','🥗','🍕','🍣','🍜','🍝','🍲','🍛','🍱','🍤','🍦','🍧','🍩','🍪','🎂','🍰','☕','🍵','🥤','🍺','🍷','🥐','🧆','🥞','🧇','🧁'] },
    { icon: '⚽', label: 'Actividades', emojis: ['⚽','🏀','🏈','⚾','🥎','🏐','🏉','🎾','🏓','🏸','🎯','🎱','🥊','🥋','⛷️','🏂','🏋️','🤸','🏊','🚴','🎮','🎲','🧩','🎭','🎨','🎬','🎤','🎵','🎶','🎸','🥁','🎺','🎻','🎰','🎳','🎯','🏆','🥇','🥈','🥉','🎖️','🏅'] },
    { icon: '💡', label: 'Objetos', emojis: ['💡','🔦','🕯️','💰','💳','💎','📱','💻','⌨️','🖥️','🖨️','🖱️','📷','📸','📹','📺','📻','📡','🔋','💾','💿','📀','🔭','🔬','🧪','📚','📖','📝','✏️','🖊️','📌','📍','🗓️','✂️','🔒','🔑','🔨','⚙️','🔧','🔩','🧲','💊','🏠','🚗','✈️','🚀','⛵','🚁','🚂','🌐'] },
    { icon: '❤️', label: 'Símbolos', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','✨','⭐','🌟','💫','⚡','💥','🎉','🎊','🎈','🔔','❓','❗','‼️','⚠️','🚫','✅','❌','➕','➖','✖️','♻️','💯','🔝','🆕','🆗','🆘','🔴','🟡','🟢','🔵','⬛','⬜','🟨','🟦'] },
  ];

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    content: ['', [Validators.required]],
    categoryId: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.categoriesFacade.loadAll();
  }

  readonly quillModules = {
    toolbar: '#toolbar-notes-create',
  };

  toggleEmojiPicker(): void {
    this.showEmojiPicker.update((v) => !v);
    this.selectedEmojiCategory.set(0);
  }

  closeEmojiPicker(): void {
    this.showEmojiPicker.set(false);
  }

  insertEmoji(emoji: string): void {
    const quill = this.quillEditorRef?.quillEditor;
    if (!quill) return;
    const range = quill.getSelection(true);
    const index = range?.index ?? quill.getLength() - 1;
    quill.insertText(index, emoji, 'user');
    quill.setSelection(index + emoji.length, 0);
    this.showEmojiPicker.set(false);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, content, categoryId } = this.form.getRawValue();
    this.facade.create({ title, content, categoryId }).subscribe(() => {
      this.router.navigate(['/notes']);
    });
  }

  cancel(): void {
    this.router.navigate(['/notes']);
  }

  hasError(field: 'title' | 'content' | 'categoryId', error: string): boolean {
    const control = this.form.get(field);
    return !!control?.hasError(error) && (control.dirty || control.touched);
  }
}
