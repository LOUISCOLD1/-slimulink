from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import User, Conversation, ConversationMessage
from app.core.security import get_current_user
from app.models.schemas import ConversationItem, MessageItem

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationItem])
async def list_conversations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all conversations for the current user."""
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user.id)
        .order_by(Conversation.updated_at.desc())
    )
    return [ConversationItem.model_validate(c) for c in result.scalars().all()]


@router.get("/{conversation_id}/messages", response_model=list[MessageItem])
async def get_messages(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all messages in a conversation."""
    # Verify ownership
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user.id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    msg_result = await db.execute(
        select(ConversationMessage)
        .where(ConversationMessage.conversation_id == conversation_id)
        .order_by(ConversationMessage.created_at.asc())
    )
    return [MessageItem.model_validate(m) for m in msg_result.scalars().all()]


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a conversation and all its messages (cascade)."""
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user.id,
        )
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    await db.delete(conversation)
